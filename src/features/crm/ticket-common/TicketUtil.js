import CommonFunction from '@lib/common';
import _ from "lodash";
import Excel from "exceljs";
import TicketApi from "services/TicketApi";
import ProjectEntryApi from "services/ProjectEntryService";
import TicketEnumeration from "./TicketEnumeration";

const TicketUtil = {
    stripHtml(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    },

    async exportTicketTable(_condition, t, _lazy) {
        let _categories = await ProjectEntryApi.getByType("ticket-category");

        // priority matrix
        function getPriority(_code) {
            const priorityMatrix = [
                {code: 'CRITICAL', name: t('priority-critical'), score: 7, color: "#f22515"},
                {code: 'VERY_HIGH', name: t('priority-very-high'), score: 6, color: "#f51515"},
                {code: 'HIGH', name: t('priority-high'), score: 5, color: "#c94831"},
                {code: 'MEDIUM', name: t('priority-medium'), score: 4, color: "#ea821a"},
                {code: 'LOW', name: t('priority-low'), score: 3, color: "#f8ff76"},
                {code: 'VERY_LOW', name: t('priority-very-low'), score: 2, color: "#ffd15e"},
                {code: 'UNAFFECT', name: t('priority-unaffect'), score: 1, color: "#fdd15e"}
            ];
            let _matrix = _.find(priorityMatrix, {code: _code});
            if (_matrix) {
                return _matrix
            }
            return {code: '', name: '', color: '#ffffff'}
        }

        // load data for data table
        let _params = {
            page: 0,
            size: 2000,
            body: {
                props: ["id", "code", "name", "rootPhaseId", "rootWorkPackageId", "categoryId", "startDate", "urgency", "requireWorkHour", "projectId", "deadline", "responsibleId", "requestedBy", "create_by", "start_date", "state", "impact", "type", "subtype", "responseDate", "responseDeadline", "resolvedDate", "priority", "closedOn", "resourceId", "createBy", "locationId", "description", "phone", "rootWorkPackageId", "solution"],
                include: ["involves"],
                conditions: _condition
            }
        };

        if (_lazy && _lazy.affect && _lazy.affect.projectId && _lazy.affect.projectId > 0) {
            _params.body.include.push("fields");
        }

        TicketApi.list(_params).then(async res => {
            if (res && res.content) {
                const workbook = new Excel.Workbook();
                const worksheet = workbook.addWorksheet(t('ticket-list'));
                let _dataToExport = []
                let _fieldColumn = []
                let _lazyResource = {
                    first: 0,
                    rows: 9999,
                    page: 0,
                    status: {code: 1},
                    type: {code: 'ticket-resource'}
                }
                let _resources = await ProjectEntryApi.get(_lazyResource);
                for (const objTicket of res.content) {
                    let task = objTicket.task;
                    let _fields = objTicket.fields;
                    let _involves = objTicket.involves;
                    let _objExport = {
                        projectName: task.projectName
                        , taskCode: task.code
                        , taskType: task.type
                        , taskName: task.name
                        , phaseName: task.phaseName
                        , category: _.find(_categories, {id: task.categoryId}) ? _.find(_categories, {id: task.categoryId}).name : ""
                        , startDate: task.startDate ? CommonFunction.formatDateTime(task.startDate) : ""
                        , deadline: task.deadline ? CommonFunction.formatDateTime(task.deadline) : ""
                        , taskState: t(`task.state.${task.state}`)
                        , email: task.responsibleId ? task.responsibleId.email : ""
                        , responsibleFullName: task.responsibleId ? task.responsibleId.fullName : ""
                        , requireWorkHour: task.requireWorkHour || 0
                        , responseDeadline: task.responseDeadline ? CommonFunction.formatDateTime(task.responseDeadline) : ""
                        , responseDate: task.responseDate ? CommonFunction.formatDateTime(task.responseDate) : ""
                        , resolvedDate: task.resolvedDate ? CommonFunction.formatDateTime(task.resolvedDate) : ""
                        , closedOn: task.closedOn ? CommonFunction.formatDateTime(task.closedOn) : ""
                        , urgency: task.urgency ? getPriority(task.urgency).name : ""
                        , impact: task.impact ? getPriority(task.impact).name : ""
                        , priority: task.priority ? getPriority(task.priority).name : ""
                        , requestedBy: task.requestedBy ? task.requestedBy.fullName : ""
                        , WorkPackageName: task.wpkName ? task.wpkName : ""
                        , locationId: task.locationId
                        , description: task.description ? this.stripHtml(task.description) : ""
                        , solution: task.solution ? this.stripHtml(task.solution) : ""
                        , phone: task.phone
                        , resourceId: task.resourceId ? task.resourceId.name : ""
                        , subtype: task.subtype ? task.subtype.name : ""
                    }
                    if (task) {
                        let _subtype = TicketEnumeration.dropdown.subtype.options.find(el => el.id == task.subtype);

                        if (_subtype) {
                            _objExport.subtype = _subtype.name
                        }
                        if (!CommonFunction.isEmpty(_resources)) {
                            let _resource = _resources.content.find(el => el.id === task.resourceId);
                            if (_resource) {
                                _objExport.resourceId = _resource.name
                            } else {
                                _objExport.resourceId = ""
                            }
                        }
                    }
                    if (_involves) {
                        let _observers = _.find(_involves, {role: "OBSERVER", involveType: "user"});
                        if (_observers && _observers.involveIds.length > 0) {
                            _objExport.observer = _observers.involveIds.map(_observer => _observer.fullName).toString()
                        }
                        let _assignee = _.find(_involves, {role: "ASSIGNEE", involveType: "user"});
                        if (_assignee && _assignee.involveIds.length > 0) {
                            _objExport.assignee = _assignee.involveIds.map(_observer => _observer.fullName).toString()
                        }
                        let _assignGroup = _.find(_involves, {role: "ASSIGNEE", involveType: "group"});
                        if (_assignGroup && _assignGroup.involveIds.length > 0) {
                            _objExport.assigngroup = _assignGroup.involveIds.map(_observer => _observer.name).toString()
                        }
                    }
                    if (_fields && _fields.length > 0) {
                        _fields.map(_field => {
                            let _haveFieldColumn = _.find(_fieldColumn, function (e) {
                                return (e.code === _field.fieldCode)
                            });
                            if (!_haveFieldColumn) {
                                _fieldColumn.push({
                                    code: _field.fieldCode,
                                    name: _field.fieldConfig.fieldName
                                });
                            }
                            _objExport[_field.fieldCode] = _field.values ? _field.values.toString() : ''
                        })
                    }
                    _dataToExport.push(_objExport)
                }
                // add header
                let _columnsExcel = [
                    {header: t('ticket.name'), key: 'taskCode', width: 15},
                    {header: t('common.type'), key: 'taskType', width: 15},
                    {header: t('project.name'), key: 'projectName', width: 30},
                    {header: t('phase'), key: 'phaseName', width: 30},
                    {header: t('task.history.key.name'), key: 'taskName', width: 40},
                    {header: t('ticket.category'), key: 'category', width: 30},
                    {header: t('common.create-date'), key: 'startDate', width: 25},
                    {header: t('common.resolvedeadline'), key: 'deadline', width: 25},
                    {header: t('common.state'), key: 'taskState', width: 15},
                    {header: t('workflow.position.responsible'), key: 'responsibleFullName', width: 20},
                    {header: t('common.email'), key: 'email', width: 20},
                    {header: t('ticket.observer'), key: 'observer', width: 20},
                    {header: t('task.history.key.requireWorkHour'), key: 'requireWorkHour', width: 10},
                    {header: t('common.responseDeadline'), key: 'responseDeadline', width: 25},
                    {header: t('common.responseDate'), key: 'responseDate', width: 25},
                    {header: t('common.resolvedDate'), key: 'resolvedDate', width: 25},
                    {header: t('project.closedOn'), key: 'closedOn', width: 25},
                    {header: t('ticket.urgent'), key: 'urgency', width: 15},
                    {header: t('ticket.impact'), key: 'impact', width: 15},
                    {header: t('ticket.priority'), key: 'priority', width: 15},
                    {header: t('ticket.involve.user.REQUESTER'), key: 'requestedBy', width: 15},
                    {header: t('ticket.assign'), key: 'assignee', width: 15},
                    {header: t('workpackage'), key: 'WorkPackageName', width: 15},
                    {header: t('ticket.location'), key: 'locationId', width: 15},
                    {header: t('ticket.content'), key: 'description', width: 60},
                    {header: t('ticket.solution'), key: 'solution', width: 60},
                    {header: t('ticket.phone'), key: 'phone', width: 15},
                    {header: t('ticket.assigngroup'), key: 'assigngroup', width: 15},
                    {header: t('ticket.type'), key: 'subtype', width: 15},
                    {header: t('ticket.resource'), key: 'resourceId', width: 15},
                ];

                if (_fieldColumn && _fieldColumn.length > 0) {
                    _fieldColumn.map(_field => {
                        _columnsExcel.push(
                            {header: _field.name, key: _field.code, width: 15}
                        )
                    })
                }

                worksheet.columns = _columnsExcel
                // add rows
                _dataToExport.forEach(r => {
                    worksheet.addRow(r)
                });

                // style header
                for (let i = 0; i < worksheet.columns.length; i++) {
                    worksheet.getCell(1, i + 1).style = {
                        font: {bold: true},
                        border: {
                            top: {style: 'thin'},
                            left: {style: 'thin'},
                            bottom: {style: 'thin'},
                            right: {style: 'thin'}
                        }
                    }
                }
                const titleHeader = worksheet.getRow(1)

                titleHeader.eachCell((cell, rowNumber) => {
                    if (rowNumber === 1) {
                        worksheet.getColumn(rowNumber).style = {font: {bold: true}}
                    }
                    worksheet.getColumn(rowNumber).alignment = {
                        wrapText: true,
                    };

                });

                // export
                const fileBuffer = await workbook.xlsx.writeBuffer();
                var blob = new Blob([fileBuffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = `${t('ticket-list')}.xlsx`;
                link.click();
            }
        });
    }
}

export default TicketUtil;
