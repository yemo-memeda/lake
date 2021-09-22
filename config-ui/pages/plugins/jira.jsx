import Head from 'next/head'
import { useState, useEffect } from 'react'
import styles from '../../styles/Home.module.css'
import { Classes, Tooltip, Position, FormGroup, InputGroup, Button, Label, Icon, Tab, Tabs, Overlay, Dialog } from '@blueprintjs/core'
import dotenv from 'dotenv'
import path from 'path'
import * as fs from 'fs/promises'
import { existsSync } from 'fs'
import Nav from '../../components/Nav'
import Sidebar from '../../components/Sidebar'
import Content from '../../components/Content'
import SaveAlert from '../../components/SaveAlert'
import MappingTag from '../../components/MappingTag'
import MappingTagStatus from '../../components/MappingTagStatus'

export default function Home(props) {
  const { env } = props

  const [alertOpen, setAlertOpen] = useState(false)
  const [jiraEndpoint, setJiraEndpoint] = useState(env.JIRA_ENDPOINT)
  const [jiraBasicAuthEncoded, setJiraBasicAuthEncoded] = useState(env.JIRA_BASIC_AUTH_ENCODED)
  const [jiraIssueEpicKeyField, setJiraIssueEpicKeyField] = useState(env.JIRA_ISSUE_EPIC_KEY_FIELD)
  const [jiraIssueTypeMapping, setJiraIssueTypeMapping] = useState(env.JIRA_ISSUE_TYPE_MAPPING)
  const [jiraIssueBugStatusMapping, setJiraIssueBugStatusMapping] = useState(env.JIRA_ISSUE_BUG_STATUS_MAPPING)
  const [jiraIssueIncidentStatusMapping, setJiraIssueIncidentStatusMapping] = useState(env.JIRA_ISSUE_INCIDENT_STATUS_MAPPING)
  const [jiraIssueStoryStatusMapping, setJiraIssueStoryStatusMapping] = useState(env.JIRA_ISSUE_STORY_STATUS_MAPPING)
  const [jiraIssueStoryCoefficient, setJiraIssueStoryCoefficient] = useState(env.JIRA_ISSUE_STORYPOINT_COEFFICIENT)
  const [jiraIssueStoryPointField, setJiraIssueStoryPointField] = useState(env.JIRA_ISSUE_STORYPOINT_FIELD)
  const [jiraBoardGitlabeProjects, setJiraBoardGitlabeProjects] = useState(env.JIRA_BOARD_GITLAB_PROJECTS)

  // Type mappings state
  const [typeMappingBug, setTypeMappingBug] = useState([])
  const [typeMappingIncident, setTypeMappingIncident] = useState([])
  const [typeMappingRequirement, setTypeMappingRequirement] = useState([])
  const [typeMappingAll, setTypeMappingAll] = useState()

  // Status mappings state
  const [customStatusOverlay, setCustomStatusOverlay] = useState(false)
  const [statusMappingAll, setStatusMappingAll] = useState(['bug', 'incident', 'requirement'])
  const [statusTabId, setStatusTabId] = useState(0)
  const [statusMappingRequirementBug, setStatusMappingRequirementBug] = useState([])
  const [statusMappingResolvedBug, setStatusMappingResolvedBug] = useState([])
  const [statusMappingRequirementIncident, setStatusMappingRequirementIncident] = useState([])
  const [statusMappingResolvedIncident, setStatusMappingResolvedIncident] = useState([])
  const [statusMappingRequirementStory, setStatusMappingRequirementStory] = useState([])
  const [statusMappingResolvedStory, setStatusMappingResolvedStory] = useState([])
  const [customStatus, setCustomStatus] = useState([])
  const [customStatusName, setCustomStatusName] = useState('')

  function updateEnv(key, value) {
    fetch(`/api/setenv/${key}/${encodeURIComponent(value)}`)
  }

  const ClearButton = ({onClick}) => {
    return <Button
      icon={"cross"}
      minimal={true}
      onClick={onClick}
    />
  }

  function findStrBetween(str, first, last) {
    const r = new RegExp(first + '(.*?)' + last, 'gm')
    return str.match(r)
  }

  function saveAll(e) {
    e.preventDefault()
    updateEnv('JIRA_ENDPOINT', jiraEndpoint)
    updateEnv('JIRA_BASIC_AUTH_ENCODED', jiraBasicAuthEncoded)
    updateEnv('JIRA_ISSUE_EPIC_KEY_FIELD', jiraIssueEpicKeyField)
    updateEnv('JIRA_ISSUE_TYPE_MAPPING', typeMappingAll)
    updateEnv('JIRA_ISSUE_BUG_STATUS_MAPPING', `Required:${statusMappingRequirementBug};Resolved:${statusMappingResolvedBug};`)
    updateEnv('JIRA_ISSUE_INCIDENT_STATUS_MAPPING', `Required:${statusMappingRequirementIncident};Resolved:${statusMappingResolvedIncident};`)
    updateEnv('JIRA_ISSUE_STORY_STATUS_MAPPING', `Required:${statusMappingRequirementStory};Resolved:${statusMappingResolvedStory};`)
    updateEnv('JIRA_ISSUE_STORYPOINT_COEFFICIENT', jiraIssueStoryCoefficient)
    updateEnv('JIRA_ISSUE_STORYPOINT_FIELD', jiraIssueStoryPointField)
    updateEnv('JIRA_BOARD_GITLAB_PROJECTS', jiraBoardGitlabeProjects)
    setAlertOpen(true)
  }

  useEffect(() => {
    const bug = 'Bug:' + typeMappingBug.toString() + ';'
    const incident = 'Incident:' + typeMappingIncident.toString() + ';'
    const requirement = 'Requirement:' + typeMappingRequirement.toString() + ';'
    const all = bug + incident + requirement
    setTypeMappingAll(all)
  }, [typeMappingBug, typeMappingIncident, typeMappingRequirement])

  useEffect(() => {
    const str = env.JIRA_ISSUE_TYPE_MAPPING;
    const bugs = findStrBetween(str,'Bug:',';')
    const incidents = findStrBetween(str,'Incident:',';')
    const requirements = findStrBetween(str,'Requirement:',';')

    if (bugs) setTypeMappingBug(bugs[0].slice(4, -1).split(','))
    if (incidents) setTypeMappingIncident(incidents[0].slice(9, -1).split(','))
    if (requirements) setTypeMappingRequirement(requirements[0].slice(12, -1).split(','))
  }, [])

  return (
    <div className={styles.container}>

      <Head>
        <title>Devlake Config-UI</title>
        <meta name="description" content="Lake: Config" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;600&display=swap" rel="stylesheet" />
      </Head>

      <Nav />
      <Sidebar />
      <Content>
        <main className={styles.main}>

          <form className={styles.form}>

            <div className={styles.headlineContainer}>
              <h2 className={styles.headline}>Jira Plugin</h2>
              <p className={styles.description}>Jira Account and config settings</p>
            </div>

            <div className={styles.formContainer}>
              <FormGroup
                label=""
                inline={true}
                labelFor="jira-endpoint"
                helperText="JIRA_ENDPOINT"
                className={styles.formGroup}
                contentClassName={styles.formGroup}
              >
                <Label>
                  Endpoint&nbsp;URL <span className={styles.requiredStar}>*</span>
                  <InputGroup
                    id="jira-endpoint"
                    placeholder="Enter Jira endpoint eg. https://merico.atlassian.net"
                    defaultValue={jiraEndpoint}
                    onChange={(e) => setJiraEndpoint(e.target.value)}
                    className={styles.input}
                  />
                </Label>
              </FormGroup>
            </div>

            <div className={styles.formContainer}>
              <FormGroup
                inline={true}
                labelFor="jira-basic-auth"
                helperText="JIRA_BASIC_AUTH_ENCODED"
                className={styles.formGroup}
                contentClassName={styles.formGroup}
              >
                <Label>
                  Basic&nbsp;Auth&nbsp;Token <span className={styles.requiredStar}>*</span>
                  <InputGroup
                    id="jira-basic-auth"
                    placeholder="Enter Jira Auth eg. EJrLG8DNeXADQcGOaaaX4B47"
                    defaultValue={jiraBasicAuthEncoded}
                    onChange={(e) => setJiraBasicAuthEncoded(e.target.value)}
                    className={styles.input}
                  />
                </Label>
              </FormGroup>
            </div>

            <div className={styles.headlineContainer}>
              <h3 className={styles.headline}>Type Mappings</h3>
              <p className={styles.description}>Connect custom label types to the default Jira types</p>
            </div>

            <MappingTag
              labelName="Bug"
              labelIntent="danger"
              values={typeMappingBug}
              helperText="JIRA_ISSUE_TYPE_MAPPING"
              rightElement={<ClearButton onClick={() => setTypeMappingBug([])} />}
              onChange={(values) => setTypeMappingBug(values)}
            />

            <MappingTag
              labelName="Incident"
              labelIntent="warning"
              values={typeMappingIncident}
              helperText="JIRA_ISSUE_TYPE_MAPPING"
              rightElement={<ClearButton onClick={() => setTypeMappingIncident([])} />}
              onChange={(values) => setTypeMappingIncident(values)}
            />

            <MappingTag
              labelName="Requirement"
              labelIntent="primary"
              values={typeMappingRequirement}
              helperText="JIRA_ISSUE_TYPE_MAPPING"
              rightElement={<ClearButton onClick={() => setTypeMappingRequirement([])} />}
              onChange={(values) => setTypeMappingRequirement(values)}
            />

            <div className={styles.headlineContainer}>
              <h3 className={styles.headline}>Status Mappings</h3>
              <p className={styles.description}>Add custom status mappings for bug, incident, story and anything else</p>
            </div>

            <div className={styles.formContainer}>

              <Tabs id="StatusMappings" onChange={(id) => setStatusTabId(id)} selectedTabId={statusTabId} className={styles.statusTabs}>
                <Tab id={0} title="Bug" panel={
                  <MappingTagStatus
                    reqValue={statusMappingRequirementBug}
                    resValue={statusMappingResolvedBug}
                    envName="JIRA_ISSUE_BUG_STATUS_MAPPING"
                    clearBtnReq={<ClearButton onClick={() => setStatusMappingRequirementBug([])} />}
                    clearBtnRes={<ClearButton onClick={() => setStatusMappingResolvedBug([])} />}
                    onChangeReq={(values) => setStatusMappingRequirementBug(values)}
                    onChangeRes={(values) => setStatusMappingResolvedBug(values)}
                  />
                } />
                <Tab id={1} title="Incident" panel={
                  <MappingTagStatus
                    reqValue={statusMappingRequirementIncident}
                    resValue={statusMappingResolvedIncident}
                    envName="JIRA_ISSUE_INCIDENT_STATUS_MAPPING"
                    clearBtnReq={<ClearButton onClick={() => setStatusMappingRequirementIncident([])} />}
                    clearBtnRes={<ClearButton onClick={() => setStatusMappingResolvedIncident([])} />}
                    onChangeReq={(values) => setStatusMappingRequirementIncident(values)}
                    onChangeRes={(values) => setStatusMappingResolvedIncident(values)}
                  />
                } panelClassName="ember-panel" />
                <Tab id={2} title="Story" panel={
                  <MappingTagStatus
                    reqValue={statusMappingRequirementStory}
                    resValue={statusMappingResolvedStory}
                    envName="JIRA_ISSUE_STORY_STATUS_MAPPING"
                    clearBtnReq={<ClearButton onClick={() => setStatusMappingRequirementStory([])} />}
                    clearBtnRes={<ClearButton onClick={() => setStatusMappingResolvedStory([])} />}
                    onChangeReq={(values) => setStatusMappingRequirementStory(values)}
                    onChangeRes={(values) => setStatusMappingResolvedStory(values)}
                  />
                } />
                {customStatus.length > 0 && customStatus.map((status, i) => {
                  return <Tab id={i + 3} title={status} panel={
                  //   <MappingTagStatus
                  //   reqValue={statusMappingRequirementBug}
                  //   resValue={statusMappingResolvedBug}
                  //   envName={`JIRA_ISSUE_${customStatus[i].toUpperCase()}_STATUS_MAPPING`}
                  //   clearBtnReq={<ClearButton onClick={() => setStatusMappingRequirementBug([])} />}
                  //   clearBtnRes={<ClearButton onClick={() => setStatusMappingResolvedBug([])} />}
                  //   onChangeReq={(values) => setStatusMappingRequirementBug(values)}
                  //   onChangeRes={(values) => setStatusMappingResolvedBug(values)}
                  // />
                  // TODO: finish custom status mapping
                  <p>Custom Status {i}</p>
                  } />
                })}
                <Button icon="add" onClick={() => setCustomStatusOverlay(true)} className={styles.addNewStatusBtn}>Add New</Button>

                <Dialog
                  style={{ width: '100%', maxWidth: "664px", height: "auto" }}
                  icon="diagram-tree"
                  onClose={() => setCustomStatusOverlay(false)}
                  title="Add a New Custom Status"
                  isOpen={customStatusOverlay}
                  onOpened={() => setCustomStatusName('')}
                >
                  <div className={Classes.DIALOG_BODY}>
                  <FormGroup
                    // label="Enter "
                    // inline={true}
                    // helperText="JIRA_ENDPOINT"
                    // labelFor="custom-status"
                    className={styles.formGroup}
                    contentClassName={styles.formGroup}
                  >
                    <InputGroup
                      id="custom-status"
                      placeholder="Enter custom status name"
                      defaultValue={customStatusName}
                      onChange={(e) => setCustomStatusName(e.target.value)}
                      className={styles.input}
                    />
                    <Button icon="add" onClick={() => setCustomStatus([...customStatus, customStatusName])} className={styles.addNewStatusBtn}>Add New</Button>
                  </FormGroup>
                  </div>
                </Dialog>

                <Tabs.Expander />
              </Tabs>
            </div>


            <div className={styles.headlineContainer}>
              <h3 className={styles.headline}>Jira / Gitlab Connection</h3>
              <p className={styles.description}>Connect jira board to gitlab projects</p>
              </div>

              <div className={styles.formContainer}>
              <FormGroup
                inline={true}
                labelFor="jira-board-projects"
                helperText="JIRA_BOARD_GITLAB_PROJECTS"
                className={styles.formGroup}
                contentClassName={styles.formGroup}
              >
                <Tooltip content="Jira board and Gitlab projects relationship" position={Position.TOP}>
                  <Label>
                    Jira&nbsp;Board&nbsp;Gitlab&nbsp;Projects
                    <InputGroup
                      id="jira-storypoint-field"
                      placeholder="<JIRA_BOARD>:<GITLAB_PROJECT_ID>,...; eg. 8:8967944,8967945;9:8967946,8967947"
                      defaultValue={jiraBoardGitlabeProjects}
                      onChange={(e) => setJiraBoardGitlabeProjects(e.target.value)}
                      className={styles.input}
                    />
                  </Label>
                </Tooltip>
              </FormGroup>
            </div>

            <div className={styles.headlineContainer}>
              <h3 className={styles.headline}>Additional Customization Settings</h3>
              <p className={styles.description}>Additional Jira settings</p>
            </div>

            <div className={styles.formContainer}>
              <FormGroup
                inline={true}
                labelFor="jira-story-status-mapping"
                helperText="JIRA_ISSUE_STORY_STATUS_MAPPING"
                className={styles.formGroup}
                contentClassName={styles.formGroup}
              >
                <Tooltip content="Map your custom story status to Devlake standard status" position={Position.TOP}>
                  <Label>
                    Issue&nbsp;Story
                    <InputGroup
                      id="jira-story-status-mapping"
                      placeholder="<STANDARD_STATUS_1>:<ORIGIN_STATUS_1>,<ORIGIN_STATUS_2>;<STANDARD_STATUS_2>"
                      defaultValue={jiraIssueStoryStatusMapping}
                      onChange={(e) => setJiraIssueStoryStatusMapping(e.target.value)}
                      className={styles.input}
                    />
                  </Label>
                </Tooltip>
              </FormGroup>
            </div>

            <div className={styles.formContainer}>
              <FormGroup
                inline={true}
                labelFor="jira-epic-key"
                helperText="JIRA_ISSUE_EPIC_KEY_FIELD"
                className={styles.formGroup}
                contentClassName={styles.formGroup}
              >
                  <Label>
                    Issue&nbsp;Epic&nbsp;Key&nbsp;Field <span className={styles.requiredStar}>*</span>

                    <div>
                      <Tooltip content="Get help with Issue Epic Key Field" position={Position.TOP}>
                        <a href="https://github.com/merico-dev/lake/tree/main/plugins/jira#how-do-i-find-the-custom-field-id-in-jira"
                          target="_blank"
                          className={styles.helpIcon}>
                            <Icon icon="help" size={15} />
                        </a>
                      </Tooltip>
                    </div>

                    <Tooltip content="Your custom epic key field" position={Position.TOP}>
                      <InputGroup
                        id="jira-epic-key"
                        placeholder="Enter Jira epic key field"
                        defaultValue={jiraIssueEpicKeyField}
                        onChange={(e) => setJiraIssueEpicKeyField(e.target.value)}
                        className={styles.helperInput}
                      />
                    </Tooltip>
                  </Label>
              </FormGroup>
            </div>

            <div className={styles.formContainer}>
              <FormGroup
                inline={true}
                labelFor="jira-storypoint-coef"
                helperText="JIRA_ISSUE_STORYPOINT_COEFFICIENT"
                className={styles.formGroup}
                contentClassName={styles.formGroup}
              >
                <Tooltip content="Your custom story point coefficent (optional)" position={Position.TOP}>
                  <Label>
                    Issue&nbsp;Storypoint&nbsp;Coefficient <span className={styles.requiredStar}>*</span>
                    <InputGroup
                      id="jira-storypoint-coef"
                      placeholder="Enter Jira Story Point Coefficient"
                      defaultValue={jiraIssueStoryCoefficient}
                      onChange={(e) => setJiraIssueStoryCoefficient(e.target.value)}
                      className={styles.input}
                    />
                  </Label>
                </Tooltip>
              </FormGroup>
            </div>

            <div className={styles.formContainer}>
              <FormGroup
                inline={true}
                labelFor="jira-storypoint-field"
                helperText="JIRA_ISSUE_STORYPOINT_FIELD"
                className={styles.formGroup}
                contentClassName={styles.formGroup}
              >
                <Tooltip content="Your custom story point key field" position={Position.TOP}>
                  <Label>
                    Issue&nbsp;Storypoint&nbsp;Field
                    <InputGroup
                      id="jira-storypoint-field"
                      placeholder="Enter Jira Story Point Field"
                      defaultValue={jiraIssueStoryPointField}
                      onChange={(e) => setJiraIssueStoryPointField(e.target.value)}
                      className={styles.input}
                    />
                  </Label>
                </Tooltip>
              </FormGroup>
            </div>

            <SaveAlert alertOpen={alertOpen} onClose={() => setAlertOpen(false)} />
            <Button type="submit" outlined={true} large={true} className={styles.saveBtn} onClick={saveAll}>Save Config</Button>
          </form>
        </main>
      </Content>
    </div>
  )
}

export async function getStaticProps() {

  const filePath = process.env.ENV_FILEPATH || path.join(process.cwd(), 'data', '../../.env')
  const exist = existsSync(filePath);
  if (!exist) {
    return {
      props: {
        env: {},
      }
    }
  }
  const fileData = await fs.readFile(filePath)
  const env = dotenv.parse(fileData)

  return {
    props: {
      env
    },
  }
}
