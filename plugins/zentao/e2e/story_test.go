/*
Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package e2e

import (
	"github.com/apache/incubator-devlake/models/common"
	"github.com/apache/incubator-devlake/models/domainlayer/ticket"
	"testing"

	"github.com/apache/incubator-devlake/helpers/e2ehelper"
	"github.com/apache/incubator-devlake/plugins/zentao/impl"
	"github.com/apache/incubator-devlake/plugins/zentao/models"
	"github.com/apache/incubator-devlake/plugins/zentao/tasks"
)

func TestZentaoStoryDataFlow(t *testing.T) {

	var zentao impl.Zentao
	dataflowTester := e2ehelper.NewDataFlowTester(t, "zentao", zentao)

	taskData := &tasks.ZentaoTaskData{
		Options: &tasks.ZentaoOptions{
			ConnectionId: 1,
			ProjectId:    1,
			ProductId:    3,
			ExecutionId:  1,
		},
	}

	// import raw data table
	dataflowTester.ImportCsvIntoRawTable("./raw_tables/_raw_zentao_api_stories.csv",
		"_raw_zentao_api_stories")

	// verify extraction
	dataflowTester.FlushTabler(&models.ZentaoStory{})
	dataflowTester.Subtask(tasks.ExtractStoryMeta, taskData)
	dataflowTester.VerifyTableWithOptions(&models.ZentaoStory{}, e2ehelper.TableOptions{
		CSVRelPath:  "./snapshot_tables/_tool_zentao_stories.csv",
		IgnoreTypes: []interface{}{common.NoPKModel{}},
	})

	// verify conversion
	dataflowTester.FlushTabler(&ticket.Issue{})
	dataflowTester.FlushTabler(&ticket.BoardIssue{})
	dataflowTester.Subtask(tasks.ConvertStoryMeta, taskData)
	dataflowTester.VerifyTableWithOptions(&ticket.Issue{}, e2ehelper.TableOptions{
		CSVRelPath:   "./snapshot_tables/issues_story.csv",
		IgnoreTypes:  []interface{}{common.NoPKModel{}},
		IgnoreFields: []string{"original_project"},
	})
	dataflowTester.VerifyTableWithOptions(&ticket.BoardIssue{}, e2ehelper.TableOptions{
		CSVRelPath:  "./snapshot_tables/board_issues_story.csv",
		IgnoreTypes: []interface{}{common.NoPKModel{}},
	})
}
