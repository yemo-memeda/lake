package tasks

import (
	"encoding/json"
	"fmt"
	"github.com/merico-dev/lake/plugins/core"
	"github.com/merico-dev/lake/plugins/helper"
	"github.com/merico-dev/lake/plugins/tapd/models"
	"net/http"
	"net/url"
)

const RAW_STORY_CHANGELOG_TABLE = "tapd_api_story_changelogs"

var _ core.SubTaskEntryPoint = CollectStoryChangelogs

func CollectStoryChangelogs(taskCtx core.SubTaskContext) error {
	data := taskCtx.GetData().(*TapdTaskData)
	db := taskCtx.GetDb()
	logger := taskCtx.GetLogger()
	logger.Info("collect storyChangelogs")
	since := data.Since
	incremental := false
	if since == nil {
		// user didn't specify a time range to sync, try load from database
		var latestUpdated models.TapdStoryChangelog
		err := db.Where("source_id = ?", data.Source.ID).Order("created DESC").Limit(1).Find(&latestUpdated).Error
		if err != nil {
			return fmt.Errorf("failed to get latest jira changelog record: %w", err)
		}
		if latestUpdated.ID > 0 {
			since = latestUpdated.Created.ToNullableTime()
			incremental = true
		}
	}

	collector, err := helper.NewApiCollector(helper.ApiCollectorArgs{
		RawDataSubTaskArgs: helper.RawDataSubTaskArgs{
			Ctx: taskCtx,
			Params: TapdApiParams{
				SourceId: data.Source.ID,
				//CompanyId: data.Options.CompanyId,
				WorkspaceId: data.Options.WorkspaceId,
			},
			Table: RAW_STORY_CHANGELOG_TABLE,
		},
		Incremental: incremental,
		ApiClient:   data.ApiClient,
		PageSize:    100,
		UrlTemplate: "story_changes",
		Query: func(reqData *helper.RequestData) (url.Values, error) {
			query := url.Values{}
			query.Set("workspace_id", fmt.Sprintf("%v", data.Options.WorkspaceId))
			query.Set("page", fmt.Sprintf("%v", reqData.Pager.Page))
			query.Set("limit", fmt.Sprintf("%v", reqData.Pager.Size))
			query.Set("order", "created asc")
			if since != nil {
				query.Set("created", fmt.Sprintf(">%v", since.Format("YYYY-MM-DD")))
			}
			return query, nil
		},
		GetTotalPages: GetTotalPagesFromResponse,
		ResponseParser: func(res *http.Response) ([]json.RawMessage, error) {
			var data struct {
				Stories []json.RawMessage `json:"data"`
			}
			err := helper.UnmarshalResponse(res, &data)
			return data.Stories, err
		},
	})
	if err != nil {
		logger.Error("collect story changelog error:", err)
		return err
	}
	return collector.Execute()
}

var CollectStoryChangelogMeta = core.SubTaskMeta{
	Name:        "collectStoryChangelogs",
	EntryPoint:  CollectStoryChangelogs,
	Required:    true,
	Description: "collect Tapd storyChangelogs",
}
