import axiosClient from "./axiosClient";

const HOST = "project";
// const HOST = "http://localhost:8092"

const CONFIG_SERVICE_HOST = "config";
// const CONFIG_SERVICE_HOST = "http://localhost:8089"

const PROJECT_URL = `${HOST}/project`;
const PHASE_URL = `${HOST}/phase`;
const ISSUE_URL = `${HOST}/issue`;
const WORK_PACKAGE_URL = `${HOST}/work-package`;
const DASHBOARD_URL = `${HOST}/dashboard`;
const WORKFLOW_URL = `${HOST}/workflow`;
const REFERENCE_URL = `${HOST}/task-reference`;
const VERSION_URL = `${HOST}/project/involve/version`;
const PERMISSION_URL = `${HOST}/project/involve`;
const OT_URL = `${HOST}/ot`;
const RESOURCE_URL = `${HOST}/resource`;
const LOCATION_URL = `${HOST}/location`;
const CONFIG_URL = `${HOST}/category`;
const TASK_URL = `${HOST}/task`;
const TASK_DOCUMENT_URL = `${HOST}/task-document`;
const TICKET_API = "ticket/ticket";
const PROJECT_QUALITY = `${HOST}/quality`;
const PROJECT_DAILY = `${HOST}/daily`;

const CONFIG_SERVICE_URL = `${CONFIG_SERVICE_HOST}/time`;
const CONFIG_SERVICE_HOST_HOLIDAY_URL = `${CONFIG_SERVICE_HOST}/time/holiday`;

const STORAGE_API = "storage/attachment";

const ProjectApi = {
    get: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                status: payload.status,
                state: payload.state,
                listShow: 1,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
            },
        });
    },

    list: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/list`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                managerId: payload.managerId,
                categoryId: payload.categoryId,
                status: payload.status,
                state: payload.state,
                fromDate: payload.fromDate,
                toDate: payload.toDate,
                includeWorkLog: payload.includeWorkLog,
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
            },
        });
    },

    getById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/by-id/${id}`);
    },

    create: (payload) => {
        return axiosClient.post(`${PROJECT_URL}/create`, {
            managerId: payload.managerId,
            categoryId: payload.categoryId,
            description: payload.description,
            startDate: payload.startDate,
            endDate: payload.endDate,
            closeDate: payload.closeDate,
            code: payload.code,
            name: payload.name,
            status: payload.status,
            phases: payload.phases,
            state: payload.state,
            type: payload.type,
            expectedManMonth: payload.expectedManMonth,
            linkSystem: payload.linkSystem,
        });
    },

    update: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/update`, {
            id: payload.id,
            managerId: payload.managerId,
            categoryId: payload.categoryId,
            description: payload.description,
            startDate: payload.startDate,
            endDate: payload.endDate,
            closeDate: payload.closeDate,
            code: payload.code,
            name: payload.name,
            status: payload.status,
            phases: payload.phases,
            groupId: payload.groupId,
            state: payload.state,
            type: payload.type,
            expectedManMonth: payload.expectedManMonth,
            linkSystem: payload.linkSystem,
        });
    },

    createAttachments: (folder, files, attachment) => {
        let formData = new FormData();
        formData.append("files", files);
        formData.append("attachment", JSON.stringify(attachment));

        return axiosClient.post(`${STORAGE_API}/upload${folder ? "/" + folder : ""}`, formData, {
            headers: {
                "content-type": "multipart/form-data",
            },
        });
    },

    /**
     * create attachments
     * @param {*} files
     * @param {*} attachment
     */
    updateAttachments: (folder, refId, files, attachment) => {
        let formData = new FormData();
        if (files) {
            formData.append("files", files);
        }
        formData.append("attachment", JSON.stringify(attachment));

        return axiosClient.put(`${STORAGE_API}/upload${folder ? "/" + folder : ""}/${refId}`, formData, {
            headers: {
                "content-type": "multipart/form-data",
            },
        });
    },

    /**
     * create attachments
     * @param {*} files
     * @param {*} attachment
     */
    deleteAttachments: (folder, refId) => {
        return axiosClient.delete(`${STORAGE_API}/upload${folder ? "/" + folder : ""}/${refId}`);
    },

    updatePriority: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/update-priority`, {
            id: payload.id,
            managerId: payload.managerId,
            categoryId: payload.categoryId,
            description: payload.description,
            startDate: payload.startDate,
            endDate: payload.endDate,
            closeDate: payload.closeDate,
            code: payload.code,
            name: payload.name,
            status: payload.status,
            phases: payload.phases,
            groupId: payload.groupId,
            state: payload.state,
            type: payload.type,
            expectedManMonth: payload.expectedManMonth,
        });
    },

    disable: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/disable`, {
            id: payload.id,
            type: payload.type,
            code: payload.code,
            name: payload.name,
            status: payload.status,
        });
    },

    enable: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/enable`, {
            id: payload.id,
            type: payload.type,
            code: payload.code,
            name: payload.name,
            status: payload.status,
        });
    },

    getProjectByGroupId: (id, buildAll, timeVersionId) => {
        let url = `${PROJECT_URL}/by-group-id/${id}`;
        if (buildAll) {
            url = url + `?buildAll=${buildAll}`;
        }
        return axiosClient.get(url, {
            params: {
                versionId: timeVersionId,
            },
        });
    },

    getByGroupId: (id) => {
        return axiosClient.get(`${PROJECT_URL}/by-group/${id}`);
    },

    getInformation: (id) => {
        return axiosClient.get(`${PROJECT_URL}/information/get/${id}`);
    },

    updateInformation: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/information/update`, payload);
    },

    searchDeliverable: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/deliverable/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                status: payload.status ? payload.status.code : "-1",
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                projectId: payload.projectId ? payload.projectId : "-1",
                referenceType: payload.referenceType ? payload.referenceType : "#",
                referenceId: payload.referenceId ? payload.referenceId : "-1",
                groupId: payload.groupId ? payload.groupId : "-1",
                state: payload.state ? payload.state : "#",
            },
        });
    },

    searchCost: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/cost/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                status: payload.status ? payload.status.code : "-1",
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                projectId: payload.projectId ? payload.projectId : "-1",
                versionId: payload.versionId ? payload.versionId : "0",
                type: payload.type,
                referenceType: payload.referenceType ? payload.referenceType : "#",
                referenceId: payload.referenceId ? payload.referenceId : "-1",
                groupId: payload.groupId ? payload.groupId : "-1",
                state: payload.state ? payload.state : "#",
            },
        });
    },

    searchCostDetail: (payload) => {
        return axiosClient.get(`${PROJECT_URL}/cost/detail/search`, {
            params: {
                search: payload.filter,
                page: payload.page,
                size: payload.rows,
                status: payload.status ? payload.status.code : "-1",
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                projectId: payload.projectId ? payload.projectId : "-1",
                versionId: payload.versionId ? payload.versionId : "0",
                costId: payload.costId ? payload.costId : "0",
                rootId: payload.rootId ? payload.rootId : "0",
                groupId: payload.groupId ? payload.groupId : "-1",
                state: payload.state ? payload.state : "#",
            },
        });
    },

    getUniquePhasesByProjectId: (projectId) => {
        return axiosClient.get(`${PROJECT_URL}/unique-phases/${projectId}`);
    },

    getUniqueWorkpackageByRootPhaseId: (projectId, rootPhaseId) => {
        return axiosClient.get(`${PROJECT_URL}/unique-wpk-by-phase/${projectId}`, { params: { rootPhaseId: rootPhaseId } });
    },

    getDetail: (id) => {
        return axiosClient.get(`${PROJECT_URL}/cost/detail/${id}`);
    },

    getDetailByCost: (id) => {
        return axiosClient.get(`${PROJECT_URL}/detail-by-cost/${id}`);
    },

    getDeliverableById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/deliverable/${id}`);
    },

    getCostById: (id) => {
        return axiosClient.get(`${PROJECT_URL}/cost/${id}`);
    },

    updateDeliverable: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/deliverable/update`, payload);
    },

    updateCost: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/cost/update`, payload);
    },

    updateCostDetail: (payload) => {
        return axiosClient.put(`${PROJECT_URL}/cost/update-detail`, payload);
    },

    searchPhase: (payload) => {
        return axiosClient.get(`${PHASE_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 999,
                status: payload.status ? payload.status : "-1",
                sort: (payload.sortField ? payload.sortField : "id") + (payload.sortOrder < 0 ? ",desc" : ""),
                projectId: payload.projectId ? payload.projectId : "-1",
                versionId: payload.versionId ? payload.versionId : "-1",
            },
        });
    },

    getUniquePhases: (projectId) => {
        return axiosClient.get(`${PHASE_URL}/unique-by-root/${projectId}`);
    },

    getPhaseByIdKeyAndVersion: (id, versionId) => {
        return axiosClient.get(`${PHASE_URL}/phase-by-root-id-and-version/${id}/${versionId}`);
    },

    searchIssue: (payload) => {
        return axiosClient.get(`${ISSUE_URL}/search`, {
            params: {
                search: payload.filter,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
                projectId: payload.projectId ? payload.projectId : "-1",
                phaseIds: payload.phaseIds ? payload.phaseIds : "0",
                type: payload.type ? payload.type : null,
                categoryIds: payload.categoryIds ? payload.categoryIds : "0",
                priorities: payload.priorities ? payload.priorities : null,
                states: payload.states ? payload.states : "",
                issueUserId: payload.issueUserId ? payload.issueUserId : null,
                responsibleUserId: payload.responsibleUserId ? payload.responsibleUserId : null,
                due: payload.due ? payload.due : null,
                startDate: payload.startDate,
                endDate: payload.endDate,
            },
        });
    },

    getHistoryByIssue: (id, payload) => {
        return axiosClient.get(`${ISSUE_URL}/history/search/${id}`, {
            params: {
                search: payload.filter,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
            },
        });
    },

    searchIssueGroupByState: (payload) => {
        return axiosClient.get(`${ISSUE_URL}/search-group-by-state`, {
            params: {
                search: payload.filter,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
                projectId: payload.projectId ? payload.projectId : "-1",
                phaseIds: payload.phaseIds ? payload.phaseIds : "0",
                type: payload.type ? payload.type : "#",
                categoryIds: payload.categoryIds ? payload.categoryIds : "0",
                priorities: payload.priorities ? payload.priorities : "#",
                states: payload.states,
                issueUserId: payload.issueUserId ? payload.issueUserId : "#",
                responsibleUserId: payload.responsibleUserId ? payload.responsibleUserId : "#",
                due: payload.due ? payload.due : "#",
            },
        });
    },

    getTotalIssueByState: (payload) => {
        return axiosClient.get(`${ISSUE_URL}/total-by-state`, {
            params: {
                search: payload.filter,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
                projectId: payload.projectId ? payload.projectId : "-1",
                phaseId: payload.phaseId ? payload.versionId : "-1",
                type: payload.type ? payload.type : "#",
                categoryIds: payload.categoryIds ? payload.categoryIds : "0",
                priorities: payload.priorities ? payload.priorities : "#",
                states: payload.states ? payload.states : "#",
                issueUserId: payload.issueUserId ? payload.issueUserId : "#",
                responsibleUserId: payload.responsibleUserId ? payload.responsibleUserId : "#",
                due: payload.due ? payload.due : "#",
            },
        });
    },

    searchWorkPackageGroupByState: (payload) => {
        return axiosClient.get(`${WORK_PACKAGE_URL}/search-group-by-state`, {
            params: {
                search: payload.filter,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
                versionId: payload.versionId ? payload.versionId : "-1",
                projectId: payload.projectId ? payload.projectId : "-1",
                phaseId: payload.phaseId ? payload.phaseId : "-1",
                state: payload.state ? payload.state : "#",
                status: payload.status ? payload.status : "-1",
            },
        });
    },

    getWorkPackageById: (id) => {
        return axiosClient.get(`${WORK_PACKAGE_URL}/by-id/${id}`);
    },

    getWorkPackageByRootIdAndVersion: (id, versionId) => {
        return axiosClient.get(`${WORK_PACKAGE_URL}/by-root-id-and-version/${id}/${versionId}`);
    },

    getWorkPackageByRootKeyAndVersion: (id, versionId) => {
        return axiosClient.get(`${WORK_PACKAGE_URL}/by-root-key-and-version/${id}/${versionId}`);
    },

    startWorkPackageRecursive: (id) => {
        return axiosClient.put(`${WORK_PACKAGE_URL}/start-recursive/${id}`);
    },
    closeWorkPackageRecursive: (id) => {
        return axiosClient.put(`${WORK_PACKAGE_URL}/close-recursive/${id}`);
    },

    getIssueById: (id) => {
        return axiosClient.get(`${ISSUE_URL}/${id}`);
    },

    getIssueDisplayById: (id) => {
        return axiosClient.get(`${ISSUE_URL}/display-by-id/${id}`);
    },

    createIssue: (payload) => {
        return axiosClient.post(`${ISSUE_URL}`, payload);
    },

    updateIssue: (payload) => {
        return axiosClient.put(`${ISSUE_URL}/${payload.id}`, payload);
    },

    changeStateAssigned: (id, payload) => {
        return axiosClient.put(`${ISSUE_URL}/assign/${id}`, payload);
    },

    changeStateOpening: (id, payload) => {
        return axiosClient.put(`${ISSUE_URL}/re-open/${id}`, payload);
    },

    changeStateProgress: (id, payload) => {
        return axiosClient.put(`${ISSUE_URL}/progress/${id}`, payload);
    },

    changeStateSolved: (id, payload) => {
        return axiosClient.put(`${ISSUE_URL}/solve/${id}`, payload);
    },

    changeStateClosed: (id, payload) => {
        return axiosClient.put(`${ISSUE_URL}/close/${id}`, payload);
    },
    changeStatePending: (id, payload) => {
        return axiosClient.put(`${ISSUE_URL}/pending/${id}`, payload);
    },

    //////DASHBOARDD
    getWorkState: (projectId) => {
        return axiosClient.get(`${DASHBOARD_URL}/get-work-state/${projectId}`);
    },

    getIssueState: (type, projectId) => {
        return axiosClient.get(`${DASHBOARD_URL}/get-issue-state/${type}/${projectId}`);
    },

    //////WORKFLOW
    getPWorkflowByProjectId: (projectId) => {
        return axiosClient.get(`${WORKFLOW_URL}/by-project-id/${projectId}`);
    },

    getPWorkflowById: (id) => {
        return axiosClient.get(`${WORKFLOW_URL}/by-id/${id}`);
    },

    getPWorkflowByProjectAndType: (projectId, type) => {
        return axiosClient.get(`${WORKFLOW_URL}/by/${projectId}/${type}`);
    },

    createOrReplacePWorkflow: (payload) => {
        return axiosClient.post(`${WORKFLOW_URL}/create-and-replace`, payload);
    },

    updateWorkflowToPWorkflow: (id, payload) => {
        return axiosClient.put(`${WORKFLOW_URL}/update-workflow/${id}`, payload);
    },

    //////REFERENCE
    createReference: (payload) => {
        return axiosClient.post(`${REFERENCE_URL}`, payload);
    },

    getReferencesByProject: (payload) => {
        return axiosClient.get(`${REFERENCE_URL}/by-reference`, {
            params: {
                page: payload.page,
                size: payload.rows,
                projectId: payload.projectId,
                toType: payload.toType,
                toId: payload.toId,
                fromType: payload.fromType,
                fromId: payload.fromId,
                status: payload.status || 1,
            },
        });
    },

    updateReference: (id, payload) => {
        return axiosClient.put(`${REFERENCE_URL}/${id}`, payload);
    },

    deleteReference: (id) => {
        return axiosClient.delete(`${REFERENCE_URL}/${id}`);
    },

    deleteReferenceByObject: (objectType, objectId) => {
        return axiosClient.delete(`${REFERENCE_URL}/by-object/${objectType}/${objectId}`);
    },

    getReferenceByProjectId: (id) => {
        return axiosClient.get(`${REFERENCE_URL}/by-project/${id}`);
    },

    //////VERSION
    getVersionsByProjectId: (projectId, type) => {
        return axiosClient.get(`${VERSION_URL}/${projectId}/${type}`);
    },

    getVersionsById: (id) => {
        return axiosClient.get(`${VERSION_URL}/${id}`);
    },

    createVersion: (payload) => {
        return axiosClient.post(`${VERSION_URL}/create`, payload);
    },

    updateVersion: (payload) => {
        return axiosClient.put(`${VERSION_URL}/update`, payload);
    },

    approveVersion: (payload) => {
        return axiosClient.put(`${VERSION_URL}/approve`, payload);
    },

    createAndRemapVersion: (payload) => {
        return axiosClient.post(`${VERSION_URL}/create-and-remap`, payload);
    },

    // OT
    createOrUpdateOt: (payload) => {
        return axiosClient.put(`${OT_URL}/update`, {
            id: payload.id,
            code: payload.code,
            projectId: payload.projectId,
            informUserIds: payload.informUserIds,
            informHrIds: payload.informHrIds,
            reason: payload.reason,
            cancelReason: payload.cancelReason,
            isOffice: payload.isOffice,
            state: payload.state,
            details: payload.details,
        });
    },

    searchOt: (payload) => {
        return axiosClient.get(`${OT_URL}/search`, {
            params: {
                projectId: payload.projectId ? payload.projectId : 0,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                state: payload.search.state ? payload.search.state : null,
                createDateFrom: payload.search.createDateFrom ? payload.search.createDateFrom : null,
                createDateTo: payload.search.createDateTo ? payload.search.createDateTo : null,
                otDateFrom: payload.search.otDateFrom ? payload.search.otDateFrom : null,
                otDateTo: payload.search.otDateTo ? payload.search.otDateTo : null,
                reason: payload.search.reason ? payload.search.reason : null,
                userId: payload.search.userId ? payload.search.userId : null,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
            },
        });
    },

    viewByTaskOt: (payload) => {
        return axiosClient.get(`${OT_URL}/search-split-task`, {
            params: {
                projectId: payload.projectId ? payload.projectId : 0,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                state: payload.search.state ? payload.search.state : null,
                createDateFrom: payload.search.createDateFrom ? payload.search.createDateFrom : null,
                createDateTo: payload.search.createDateTo ? payload.search.createDateTo : null,
                otDateFrom: payload.search.otDateFrom ? payload.search.otDateFrom : null,
                otDateTo: payload.search.otDateTo ? payload.search.otDateTo : null,
                reason: payload.search.reason ? payload.search.reason : null,
                userId: payload.search.userId ? payload.search.userId : null,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
            },
        });
    },

    getOTPlanById: (id) => {
        return axiosClient.get(`${OT_URL}/${id}`);
    },
    getOTPlanByIds: (ids) => {
        return axiosClient.get(`${OT_URL}/by-ids?ids=${ids}`);
    },

    requestApprovedOt: (payload) => {
        return axiosClient.put(`${OT_URL}/create-request`, payload);
    },
    getTotalHourOt: (projectId, userId) => {
        let url = `${OT_URL}/total-number/${projectId}`;
        if (userId) {
            url = url + `?userId=${userId}`;
        }
        return axiosClient.get(url);
    },

    // location
    searchLocation: (payload) => {
        return axiosClient.get(`${LOCATION_URL}/search`, {
            params: {
                projectId: payload.projectId ? payload.projectId : 0,
                page: payload.page ? payload.page : 0,
                size: payload.rows ? payload.rows : 20,
                status: payload.status ? payload.status : null,
                search: payload.search ? payload.search : null,
                sort: payload.sortField ? payload.sortField : "id",
            },
        });
    },
    createOrUpdateLocation: (payload) => {
        return axiosClient.post(`${LOCATION_URL}/create-or-replace`, {
            id: payload.id,
            projectId: payload.projectId,
            code: payload.code,
            address: payload.address,
            countryCode: payload.countryCode,
            provinceCode: payload.provinceCode,
            districtCode: payload.districtCode,
            wardCode: payload.wardCode,
            schemaId: payload.schemaId,
            description: payload.description,
            status: payload.status && payload.status == true ? 1 : 0,
        });
    },
    grantLocation: (payload) => {
        return axiosClient.post(`${LOCATION_URL}/grant`, {
            locationIds: payload.selectedCalendarPayload || [],
            schemaId: payload.schemaIdPayload || 0,
        });
    },

    ///////////RESOURCE API////////////
    getResourceAllocate: (projectId, versionId) => {
        return axiosClient.get(`${RESOURCE_URL}/by-version?projectId=${projectId}&versionId=${versionId}`);
    },
    getResourceAllocateActual: (projectId, versionId) => {
        return axiosClient.get(`${RESOURCE_URL}/actual-by-version?projectId=${projectId}&timeVersionId=${versionId}`);
    },
    getResourceActualByWorkLog: (projectId) => {
        return axiosClient.get(`${RESOURCE_URL}/get-actual-by-work-log/${projectId}`);
    },
    addResourceAllocate: (payload) => {
        return axiosClient.post(`${RESOURCE_URL}/add-resource`, payload);
    },

    getResourceAllocateByVersion: (projectId) => {
        return axiosClient.get(`${RESOURCE_URL}/get-allocate-by-version/${projectId}`);
    },

    // PERMISSION_URL
    getPermission: (payload) => {
        return axiosClient.get(`${PERMISSION_URL}/permission-menu`, payload);
    },

    // CONFIG_URL
    getUserSetting: (projectId) => {
        return axiosClient.get(`${CONFIG_URL}/user/config/${projectId}`);
    },
    getProjectSetting: (projectId) => {
        return axiosClient.get(`${CONFIG_URL}/project/config/${projectId}`);
    },
    updateUserSetting: (projectId, payload) => {
        return axiosClient.put(`${CONFIG_URL}/user/config/${projectId}`, payload);
    },
    updateProjectSetting: (projectId, payload) => {
        return axiosClient.put(`${CONFIG_URL}/project/config/${projectId}`, payload);
    },

    //// TASK Handle ////
    task: {
        list: (payload) => {
            var sort = payload.sortField ? `${payload.sortField},${payload.sortOrder === -1 ? "desc" : "asc"}` : "create_date,desc";
            var url = `${TASK_URL}/filter?page=${payload.page}&size=${payload.size}&sort=${sort}`;
            return axiosClient.post(url, payload.body);
        },

        getUserTasks: (payload) => {
            var sort = (payload.sortField ? payload.sortField : "id,desc") + (payload.sortOrder < 0 ? ",desc" : "");
            var url = `${TASK_URL}/task/user-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`;
            var body = payload.condition;
            return axiosClient.post(url, body);
        },

        getRequestTasks: (payload) => {
            var sort = (payload.sortField ? payload.sortField : "id,desc") + (payload.sortOrder < 0 ? ",desc" : "");
            var url = `${TASK_URL}/workflow-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`;
            var body = payload.condition;
            return axiosClient.post(url, body);
        },

        getGroupTasks: (payload) => {
            var sort = (payload.sortField ? payload.sortField : "id,desc") + (payload.sortOrder < 0 ? ",desc" : "");
            var url = `${TASK_URL}/group-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`;
            var body = payload.condition;
            return axiosClient.post(url, body);
        },

        getBaseTasks: (payload) => {
            var sort = (payload.sortField ? payload.sortField : "id,desc") + (payload.sortOrder < 0 ? ",desc" : "");
            var url = `${TASK_URL}/base-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`;
            var body = payload.condition;
            return axiosClient.post(url, body);
        },

        getTotalTask: (payload) => {
            var sort = (payload.sortField ? payload.sortField : "name") + (payload.sortOrder < 0 ? " desc" : "");
            var url = `${TASK_URL}/total-tasks?page=${payload.page}&size=${payload.size}&sort=${sort}`;
            url = url + (payload.groupIds ? "&groupIds=" + payload.groupIds : "");

            var body = payload.condition;
            return axiosClient.post(url, body);
        },

        getAll: () => {
            return axiosClient.get(`${TASK_URL}`);
        },

        sign: (taskId, docIds) => {
            return axiosClient.post(`${TASK_URL}/sign/${taskId}`, docIds);
        },

        search: (payload) => {
            return axiosClient.get(`${TASK_URL}/search`, {
                params: {
                    type: payload.type ? payload.type : "",
                    status: payload.status ? payload.status : -1,
                    search: payload.filter,
                },
            });
        },

        get: (payload) => {
            return axiosClient.get(`${TASK_URL}`, {
                params: {
                    search: payload.filter,
                    page: payload.page,
                    size: payload.rows,
                    sort: (payload.sortField ? payload.sortField : "name") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        getChildren: (id, payload) => {
            return axiosClient.get(`${TASK_URL}/children/${id}`, {
                params: {
                    type: payload && payload.type ? payload.type : "",
                },
            });
        },

        /**
         * get task histories
         * @param {*} id
         * @returns
         */
        getHistories: (id, payload) => {
            return axiosClient.get(`${TASK_URL}/histories/${id}?page=${payload.page || 0}&size=${payload.size || 5}`);
        },

        getReferences: (taskId) => {
            return axiosClient.get(`${TASK_URL}/task-reference/${taskId}`);
        },

        addReference: (payload) => {
            return axiosClient.post(`${TASK_URL}/task-reference`, payload);
        },

        getHistory: (taskId, payload) => {
            return axiosClient.get(`${TASK_URL}/history/search/${taskId}`, {
                params: {
                    page: payload.page,
                    size: payload.size,
                    sort: (payload.sortField ? payload.sortField : "actionDate,desc") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        getById: (id, include) => {
            if (!include) {
                include = "next-states";
            }
            return axiosClient.get(`${TASK_URL}/${id}?include=${include || ""}`);
        },

        getByIdAndType: (id, type) => {
            return axiosClient.get(`${TASK_URL}/with-type/${id}`, {
                params: {
                    type: type ? type : "TASK",
                },
            });
        },

        create: (payload, include) => {
            if (!include) {
                include = "next-states";
            }
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.post(`${TASK_URL}?include=${include || ""}`, payload);
        },

        update: (payload, include) => {
            if (!include) {
                include = "next-states";
            }
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.put(`${TASK_URL}/${payload.task.id}?include=${include || ""}`, payload);
        },

        // delete: (payload) => {
        //     return axiosClient.delete(`${TASK_URL}/group/${payload.id}`);
        // },

        assign: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.put(`${TASK_URL}/assign/${payload.id}`, payload);
        },

        markImportant: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            if (payload.important) {
                return axiosClient.put(`${TASK_URL}/important/${payload.id}`, payload);
            } else {
                return axiosClient.put(`${TASK_URL}/unimportant/${payload.id}`, payload);
            }
        },

        escalate: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.put(`${TASK_URL}/escalate/${payload.id}`, payload);
        },

        changeState: (payload, cmd, include) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            if (!include) {
                include = "next-states";
            }
            return axiosClient.put(`${TASK_URL}/change-state/${payload.task.id}?include=${include}`, payload, { params: { cmd: cmd } });
        },

        getDocumentsByTask: (taskId) => {
            return axiosClient.get(`${TASK_DOCUMENT_URL}/documents-by-task/${taskId}`);
        },

        getDocumentsByDocId: (taskDocumentId) => {
            return axiosClient.get(`${TASK_DOCUMENT_URL}/document-by-id/${taskDocumentId}`);
        },

        uploadDocument: (payload) => {
            let formData = new FormData();
            formData.append("id", payload.id);
            if (payload.fileId) {
                formData.append("fileId", payload.fileId);
            }
            formData.append("name", payload.name);
            formData.append("code", payload.code);
            formData.append("type", payload.type);
            formData.append("taskId", payload.taskId);
            formData.append("versionNo", payload.versionNo);
            formData.append("description", payload.description);
            formData.append("action", payload.action);

            return axiosClient.put(`${TASK_DOCUMENT_URL}/upload-document`, formData, {
                headers: {
                    "content-type": "multipart/form-data",
                },
            });
        },

        getDocumentByHistory: (payload) => {
            return axiosClient.get(`${TASK_DOCUMENT_URL}/document/history-by-version`, {
                params: {
                    taskDocumentId: payload.taskDocumentId,
                    versionNo: payload.versionNo,
                    page: payload.page,
                    size: payload.rows,
                    sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        getHistoryByDocumentId: (payload) => {
            return axiosClient.get(`${TASK_DOCUMENT_URL}/document/history-by-document-id`, {
                params: {
                    taskDocumentId: payload.taskDocumentId,
                    sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        preview: (taskId, documentId) => {
            return axiosClient.get(`${TASK_DOCUMENT_URL}/document-merge-preview/${documentId}?taskId=${taskId}`);
        },

        getDocumentVersionByTask: (payload) => {
            return axiosClient.get(`${TASK_DOCUMENT_URL}/document/version`, {
                params: {
                    taskDocumentId: payload.taskDocumentId,
                },
            });
        },

        getMentions: (id) => {
            return axiosClient.get(`${TASK_URL}/mention/${id}`);
        },

        createMention: (payload) => {
            payload.referenceType = payload.referenceType ? payload.referenceType : "task";
            payload.referenceId = payload.referenceId ? payload.referenceId : payload.taskId;
            payload.status = 1;
            return axiosClient.post(`${TASK_URL}/mention/add`, payload);
        },

        updateMention: (payload) => {
            payload.referenceType = "task";
            payload.referenceId = payload.taskId;
            return axiosClient.put(`${TASK_URL}/mention`, payload);
        },

        searchMention: (payload) => {
            return axiosClient.get(`${TASK_URL}/search`, {
                params: {
                    referenceType: "task",
                    referenceId: payload.taskId,
                    status: 1,
                    search: payload.filter,
                },
            });
        },

        getTaskStateByDay: (groupIds) => {
            return axiosClient.get(`/task/dashboard/get-state-task-day-by-group?groupId=${groupIds}`);
            // return axiosClient.get(`http://localhost:8086/dashboard/get-state-task-day-by-group?groupId=${groupIds}`);
        },

        getTaskActivityStream: (groupIds) => {
            return axiosClient.get(`${TASK_URL}/history/get-task-activity-stream?groupId=${groupIds}`);
        },

        getDashboardMainIndex: () => {
            return axiosClient.get(`${TASK_URL}/dashboard/main-index`);
        },
    },
    // working_time
    working_time: {
        get: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_URL + "/all-active"}`, {
                params: {
                    page: payload.page,
                    size: payload.rows,
                    sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        getByDeferenceAndDefault: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_URL + "/by-reference-and-default"}`, {
                params: {
                    referenceType: payload.referenceType,
                    referenceId: payload.referenceId,
                },
            });
        },

        getFullCalendar: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_URL + "/full-calendar"}`, {
                params: {
                    types: payload.types,
                    includeGlobal: payload.includeGlobal,
                    referenceType: payload.referenceType,
                    referenceId: payload.referenceId,
                },
            });
        },

        getById: (id) => {
            return axiosClient.get(`${CONFIG_SERVICE_URL}/schema/${id}`);
        },

        getByDefault: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.get(`${CONFIG_SERVICE_URL}/default-schema`, {
                params: {
                    status: payload.status,
                },
            });
        },

        create: (payload) => {
            return axiosClient.post(`${CONFIG_SERVICE_URL}/schema`, {
                schema: {
                    type: payload.type,
                    code: payload.code,
                    name: payload.name,
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                    days: payload.days,
                    description: payload.description,
                    status: payload.status,
                    isDefault: payload.isDefault,
                },
                referenceId: payload.referenceId,
                referenceType: payload.referenceType,
                isDefault: payload.isDefaultInReference,
            });
        },

        update: (payload) => {
            return axiosClient.put(`${CONFIG_SERVICE_URL}/schema`, { schema: payload });
        },

        delete: (payload) => {
            return axiosClient.delete(`${CONFIG_SERVICE_URL}/${payload.id}`);
        },

        getTemplateBySchema: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_URL}/template/by-schema/${payload.id}`, {
                params: {
                    page: payload.page,
                    size: payload.rows,
                    sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        getTemplateByHoliday: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_URL}/template/by-holiday/${payload.id}`, {
                params: {
                    page: payload.page,
                    size: payload.rows,
                    sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        getTemplateByReference: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_URL}/template/by-reference/${payload.id}`, {
                params: {
                    referenceType: payload.type,
                },
            });
        },

        getTemplateByReferenceAndHoliday: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_URL}/template/by-reference-holiday/${payload.referenceId}/${payload.holidayId}`, {
                params: {
                    referenceType: payload.type,
                },
            });
        },

        createTemplate: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });

            return axiosClient.post(`${CONFIG_SERVICE_URL}/template`, payload);
        },

        updateTemplate: (payload) => {
            // Object.keys(payload).forEach((key) => {
            //     if (typeof payload[key] === "boolean") {
            //         payload[key] = payload[key] ? 1 : 0;
            //     }
            // });
            return axiosClient.put(`${CONFIG_SERVICE_URL}/template`, payload);
        },
        deleteTemplateByReference: (payload) => {
            return axiosClient.delete(`${CONFIG_SERVICE_URL}/template/delete-by-reference`, {
                params: payload,
            });
        },

        deleteTemplate: (id) => {
            return axiosClient.put(`${CONFIG_SERVICE_URL}/template/delete/${id}`);
        },
    },
    holiday: {
        get: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_HOST_HOLIDAY_URL + "/search"}`, {
                params: {
                    page: payload.page,
                    size: payload.rows,
                    search: payload.filter,
                    type: payload.type,
                    sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        getAllHolidayByProject: (payload) => {
            return axiosClient.get(`${CONFIG_SERVICE_HOST_HOLIDAY_URL}/get-all-holiday-by-reference`, {
                params: {
                    types: payload.types,
                    includeGlobal: payload.includeGlobal,
                    referenceType: payload.referenceType,
                    referenceId: payload.referenceId,
                    sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },

        getAllHolidayByGroup: (groupId) => {
            return axiosClient.get(`${CONFIG_SERVICE_HOST_HOLIDAY_URL}/get-all-holiday-by-group?groupId=${groupId}`);
        },

        getById: (id) => {
            return axiosClient.get(`${CONFIG_SERVICE_HOST_HOLIDAY_URL}/${id}`);
        },

        create: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.post(`${CONFIG_SERVICE_HOST_HOLIDAY_URL}`, {
                ...payload,
                companyId: window.app_context.keycloak.tokenParsed.cid,
                userId: window.app_context.keycloak.tokenParsed.sub,
            });
        },

        createHolidayByReference: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.post(`${CONFIG_SERVICE_HOST_HOLIDAY_URL}`, {
                id: payload.id,
                type: payload.type,
                code: payload.code,
                date: payload.date,
                description: payload.description,
                status: payload.status,
                referenceType: payload.referenceType,
                referenceId: payload.referenceId,
                startTime: payload.startTime,
                duration: payload.duration,
                userId: payload.userId,
                timeDTOS: payload.timeDTOS,
            });
        },

        update: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.put(`${CONFIG_SERVICE_HOST_HOLIDAY_URL}`, payload);
        },

        updateHolidayByReference: (payload) => {
            Object.keys(payload).forEach((key) => {
                if (typeof payload[key] === "boolean") {
                    payload[key] = payload[key] ? 1 : 0;
                }
            });
            return axiosClient.put(`${CONFIG_SERVICE_HOST_HOLIDAY_URL}`, {
                id: payload.id,
                type: payload.type,
                code: payload.code,
                date: payload.date,
                description: payload.description,
                status: payload.status,
                referenceType: payload.referenceType,
                referenceId: payload.referenceId,
                startTime: payload.startTime,
                duration: payload.duration,
                userId: payload.userId,
                timeDTOS: payload.timeDTOS,
            });
        },

        delete: (payload) => {
            return axiosClient.delete(`${CONFIG_SERVICE_HOST_HOLIDAY_URL}/${payload.id}`);
        },
    },
    dashboard: {
        getDataResourceByWeekRole: (projectId) => {
            return axiosClient.get(`${DASHBOARD_URL}/getDataResourceByWeekRole`, {
                params: {
                    projectId: projectId,
                },
            });
        },

        search: (payload) => {
            return axiosClient.get(`${DASHBOARD_URL}/search`, {
                params: {
                    search: payload.search,
                    page: payload.page,
                    size: payload.rows,
                    rootKey: payload.rootKey,
                    projectId: payload.projectId,
                    refId: payload.refId,
                    refType: payload.refType,
                    state: payload.state,
                    sort: (payload.sortField ? payload.sortField : "startDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },
        searchPhaseResource: (payload) => {
            return axiosClient.get(`${DASHBOARD_URL}/search-resource-phase`, {
                params: {
                    search: payload.search,
                    page: payload.page,
                    size: payload.rows,
                    rootKey: payload.rootKey,
                    projectId: payload.projectId,
                    refId: payload.refId,
                    refType: payload.refType,
                    state: payload.state,
                    sort: (payload.sortField ? payload.sortField : "startDate") + (payload.sortOrder < 0 ? ",desc" : ""),
                },
            });
        },
        searchAllocateByPhase: (payload) => {
            return axiosClient.get(`${DASHBOARD_URL}/searchAllocateByPhase`, {
                params: {
                    projectId: payload.projectId,
                },
            });
        },
        refreshEffort: (payload) => {
            return axiosClient.post(`${HOST}/project/summary-dashboard-effort`, {
                date: payload.date,
                projectIds: payload.projectIds,
            });
        },
        refreshAllocate: (payload) => {
            return axiosClient.post(`${HOST}/project/summary-dashboard-allocate`, {
                projectIds: payload.projectIds,
            });
        },
        dataIssueRisk: (payload) => {
            return axiosClient.get(`${HOST}/project/get-issue-risk`, {
                params: {
                    type: payload.type,
                    projectId: payload.projectId,
                },
            });
        },
        sumEffortbyRole: (payload) => {
            return axiosClient.get(`${DASHBOARD_URL}/sumEffortbyRole`, {
                params: {
                    projectId: payload.projectId,
                },
            });
        },
        getDataResourceByWeek: (payload) => {
            return axiosClient.get(`${DASHBOARD_URL}/getDataResourceByWeek`, {
                params: {
                    projectId: payload.projectId,
                },
            });
        },
        sumWorklogbyUser: (payload) => {
            return axiosClient.get(`${DASHBOARD_URL}/sumWorklogbyUser`, {
                params: {
                    projectId: payload.projectId,
                },
            });
        },
        busyRateUser: (payload) => {
            return axiosClient.get(`${DASHBOARD_URL}/busyRateAllUser`, {
                params: {
                    projectId: payload.projectId,
                },
            });
        },
        projectByType: (payload) => {
            return axiosClient.post(`${HOST}/project/project-by-type`, {
                fromDate: payload.fromDate,
                toDate: payload.toDate,
            });
        },
        projectByNdu: (payload) => {
            return axiosClient.post(`${HOST}/project/project-by-ndu`, {
                fromDate: payload.fromDate,
                toDate: payload.toDate,
            });
        },
        projectByDate: (payload) => {
            return axiosClient.post(`${HOST}/project/get-list-project`, {
                fromDate: payload.fromDate,
                toDate: payload.toDate,
            });
        },
        listProjectNew: (payload) => {
            return axiosClient.post(`${HOST}/project/project-new`, {
                fromDate: payload.fromDate,
                toDate: payload.toDate,
            });
        },
        listProjectProcess: (payload) => {
            return axiosClient.post(`${HOST}/project/project-process`, {
                fromDate: payload.fromDate,
                toDate: payload.toDate,
            });
        },
        listProjectClose: (payload) => {
            return axiosClient.post(`${HOST}/project/project-close`, {
                fromDate: payload.fromDate,
                toDate: payload.toDate,
            });
        },
        ListProject: () => {
            return axiosClient.post(`${DASHBOARD_URL}/allproject`, null);
        },
        sumWorklogOtByProject: () => {
            return axiosClient.get(`${DASHBOARD_URL}/sumWorklogOtByProject`, null);
        },
        busyRateAllUser: (payload) => {
            return axiosClient.get(`${DASHBOARD_URL}/busyRateAllUser`, {
                params: {
                    projectId: payload.projectId,
                },
            });
        },
        busyRateAllProject: () => {
            return axiosClient.get(`${DASHBOARD_URL}/busyRateAllProject`, null);
        },
        getDataByWeek: () => {
            return axiosClient.get(`${DASHBOARD_URL}/getDataByWeek`, null);
        },
        getAllocateProject: (payload) => {
            return axiosClient.post(`${DASHBOARD_URL}/getAllocateProject`, {
                projectIds: payload.projectIds,
            });
        },
        countByCompany: (payload) => {
            return axiosClient.post(`${TICKET_API}/count-by-company`, {
                fromDate: payload.fromDate,
                toDate: payload.toDate,
            });
        },
        countByProject: (payload) => {
            return axiosClient.post(`${TICKET_API}/count-by-project`, {
                fromDate: payload.fromDate,
                toDate: payload.toDate,
            });
        },
        getNameProject: (payload) => {
            return axiosClient.post(`${DASHBOARD_URL}/getNameProject`, {
                projectIds: payload.projectIds,
            });
        },
        getProjectPoint: (payload) => {
            return axiosClient.post(`${HOST}/quality/project-point`, {
                date: payload.date,
            });
        },
        getCompanyPoint: (payload) => {
            return axiosClient.post(`${HOST}/quality/company-point`);
        },
    },
    quality: {
        search: (payload) => {
            return axiosClient.post(`${PROJECT_QUALITY}/search`, {
                search: payload.search,
                page: payload.page,
                size: payload.rows,
                projectId: payload.projectId,
                date: payload.date,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
            });
        },
        projectPoint: (payload) => {
            return axiosClient.post(`${PROJECT_QUALITY}/project-point`, payload);
        },
        create: (payload) => {
            return axiosClient.post(`${PROJECT_QUALITY}/create`, payload);
        },
        delete: (id) => {
            return axiosClient.delete(`${PROJECT_QUALITY}/delete/${id}`);
        },
        update: (payload) => {
            return axiosClient.put(`${PROJECT_QUALITY}/${payload.id}`, payload);
        },
    },
    daily: {
        search: (payload) => {
            return axiosClient.post(`${PROJECT_DAILY}/search`, {
                search: payload.search,
                page: payload.page,
                size: payload.rows,
                projectId: payload.projectId,
                date: payload.date,
                sort: (payload.sortField ? payload.sortField : "createDate") + (payload.sortOrder < 0 ? ",asc" : ",desc"),
            });
        },
        create: (payload) => {
            return axiosClient.post(`${PROJECT_DAILY}/create`, payload);
        },
        delete: (id) => {
            return axiosClient.delete(`${PROJECT_DAILY}/${id}`);
        },
        update: (payload) => {
            return axiosClient.put(`${PROJECT_QUALITY}/${payload.id}`, payload);
        },
    },
};

export default ProjectApi;
