package services

import (
	"context"
	"time"

	"altread-go/api/internal/database"
	"altread-go/api/internal/models"

	"gorm.io/gorm"
)

// AnalyticsService handles analytics data aggregation
type AnalyticsService struct {
	db *gorm.DB
}

// NewAnalyticsService creates a new analytics service instance
func NewAnalyticsService() *AnalyticsService {
	return &AnalyticsService{
		db: database.DB,
	}
}

// AnalyticsData represents aggregated analytics data
type AnalyticsData struct {
	TotalImagesProcessed  int64                            `json:"totalImagesProcessed"`
	TotalVoicePlays        int64                            `json:"totalVoicePlays"`
	ImagesOverTime         []ImageCountByDate               `json:"imagesOverTime"`
	VoiceUsage             []VoiceUsageStat                 `json:"voiceUsage"`
	SuccessRate            float64                          `json:"successRate"`
	AverageProcessingTime  float64                          `json:"averageProcessingTime"`
	TotalSuccessful        int64                            `json:"totalSuccessful"`
	TotalFailed            int64                            `json:"totalFailed"`
}

// ImageCountByDate represents daily image count
type ImageCountByDate struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

// VoiceUsageStat represents voice usage statistics
type VoiceUsageStat struct {
	VoiceName  string  `json:"voiceName"`
	Count      int64   `json:"count"`
	Percentage float64 `json:"percentage"`
}

// GetAnalytics retrieves aggregated analytics data for the specified time range
func (as *AnalyticsService) GetAnalytics(ctx context.Context, timeRange string) (*AnalyticsData, error) {
	// Calculate date filter
	var dateFilter time.Time
	switch timeRange {
	case "7d":
		dateFilter = time.Now().AddDate(0, 0, -7)
	case "30d":
		dateFilter = time.Now().AddDate(0, 0, -30)
	case "90d":
		dateFilter = time.Now().AddDate(0, 0, -90)
	case "all":
		dateFilter = time.Time{} // Zero time means no filter
	default:
		dateFilter = time.Now().AddDate(0, 0, -30) // Default to 30 days
	}

	data := &AnalyticsData{}

	// Build base query for image uploads
	baseImageQuery := as.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Model(&models.ImageUpload{})
	if !dateFilter.IsZero() {
		baseImageQuery = baseImageQuery.Where("created_at >= ?", dateFilter)
	}

	// Total images processed
	var totalImages int64
	if err := baseImageQuery.Count(&totalImages).Error; err != nil {
		return nil, err
	}
	data.TotalImagesProcessed = totalImages

	// Total successful and failed images
	var totalSuccessful, totalFailed int64
	successQuery := as.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Model(&models.ImageUpload{})
	if !dateFilter.IsZero() {
		successQuery = successQuery.Where("created_at >= ?", dateFilter)
	}
	if err := successQuery.Where("success = ?", true).Count(&totalSuccessful).Error; err != nil {
		return nil, err
	}
	
	failedQuery := as.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Model(&models.ImageUpload{})
	if !dateFilter.IsZero() {
		failedQuery = failedQuery.Where("created_at >= ?", dateFilter)
	}
	if err := failedQuery.Where("success = ?", false).Count(&totalFailed).Error; err != nil {
		return nil, err
	}
	data.TotalSuccessful = totalSuccessful
	data.TotalFailed = totalFailed

	// Success rate
	if totalImages > 0 {
		data.SuccessRate = float64(totalSuccessful) / float64(totalImages) * 100
	}

	// Average processing time
	avgQuery := as.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Model(&models.ImageUpload{}).
		Select("COALESCE(AVG(processing_time_ms), 0) as avg_time").
		Where("processing_time_ms IS NOT NULL")
	if !dateFilter.IsZero() {
		avgQuery = avgQuery.Where("created_at >= ?", dateFilter)
	}
	
	var result struct {
		AvgTime float64 `gorm:"column:avg_time"`
	}
	if err := avgQuery.Scan(&result).Error; err != nil {
		return nil, err
	}
	data.AverageProcessingTime = result.AvgTime

	// Images over time (daily aggregation)
	var imagesOverTime []struct {
		Date  string `gorm:"column:date"`
		Count int64  `gorm:"column:count"`
	}
	
	dateQuery := as.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Model(&models.ImageUpload{}).
		Select("created_at::date as date, COUNT(*) as count").
		Group("created_at::date")
	if !dateFilter.IsZero() {
		dateQuery = dateQuery.Where("created_at >= ?", dateFilter)
	}
	dateQuery = dateQuery.Order("created_at::date ASC")
	
	if err := dateQuery.Scan(&imagesOverTime).Error; err != nil {
		return nil, err
	}

	data.ImagesOverTime = make([]ImageCountByDate, len(imagesOverTime))
	for i, item := range imagesOverTime {
		data.ImagesOverTime[i] = ImageCountByDate{
			Date:  item.Date,
			Count: item.Count,
		}
	}

	// Build base query for voice plays
	voiceQuery := as.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Model(&models.VoicePlay{})
	if !dateFilter.IsZero() {
		voiceQuery = voiceQuery.Where("created_at >= ?", dateFilter)
	}

	// Total voice plays
	var totalVoicePlays int64
	if err := voiceQuery.Count(&totalVoicePlays).Error; err != nil {
		return nil, err
	}
	data.TotalVoicePlays = totalVoicePlays

	// Voice usage breakdown (top 10)
	var voiceUsage []struct {
		VoiceName string `gorm:"column:voice_name"`
		Count     int64  `gorm:"column:count"`
	}

	voiceUsageQuery := as.db.WithContext(ctx).Session(&gorm.Session{PrepareStmt: false}).Model(&models.VoicePlay{}).
		Select("voice_name, COUNT(*) as count").
		Group("voice_name").
		Order("count DESC").
		Limit(10)
	if !dateFilter.IsZero() {
		voiceUsageQuery = voiceUsageQuery.Where("created_at >= ?", dateFilter)
	}

	if err := voiceUsageQuery.Scan(&voiceUsage).Error; err != nil {
		return nil, err
	}

	// Calculate percentages
	data.VoiceUsage = make([]VoiceUsageStat, len(voiceUsage))
	for i, item := range voiceUsage {
		var percentage float64
		if totalVoicePlays > 0 {
			percentage = float64(item.Count) / float64(totalVoicePlays) * 100
		}
		data.VoiceUsage[i] = VoiceUsageStat{
			VoiceName:  item.VoiceName,
			Count:      item.Count,
			Percentage: percentage,
		}
	}

	return data, nil
}

