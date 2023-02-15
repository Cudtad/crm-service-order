import React, {useContext, useState} from "react";
import "./scss/UserAC.scss"


import XAutoComplete from '@ui-lib/x-autocomplete/XAutoComplete';
import ProjectService from "services/ProjectService";
import CommonFunction from '@lib/common';
import {Chip} from "primereact/chip";
import _ from "lodash";
import classNames from "classnames";


export const DeliverableAC = (props) => {
    const [filtered, setFiltered] = useState();
    const { user } = props;
    const t = CommonFunction.t;

    const { value, onChange, className, project, status, disabled, states } = props;

    const referenceScopes = [
        {
            code: 'project',
            name: t('project')
        },
        {
            code: 'phase',
            name: t('phase')
        },
        // {
        //     code: 'work-package',
        //     name: t('work-package')
        // },
        {
            code: 'task',
            name: t('task')
        }
    ]

    const itemTemplate = (item) => {
        return (
            <div>
                <div className={classNames({"dense flex align-items-center":true, "pl-2": true, "p-text-line-through": (!item.state || item.state === 'cancelled') })} >
                    {/* deliverable name */}
                    <div>
                        <b>
                            {item.name}
                        </b>
                    </div>
                    {/* time */}
                    <div>
                        <span className='bx bx-timer text-grey-6'></span>
                        <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>
                        <span>{CommonFunction.formatDate(item.deadline)}</span>
                    </div>
                </div>
                <div className="flex">
                    {item.deliverableCreatorUser && <div className="flex mt-1 mr-2">
                        <div className="flex">
                            <Chip label={item.deliverableCreatorUser.fullName}
                                  image={CommonFunction.getImageUrl(item.deliverableCreatorUser.avatar, item.deliverableCreatorUser.fullName)}
                                  className="tiny text-ellipsis task-page-responsible-by-user-tooltip" />
                            {item.deliverableCreatorUser.group && <small className="pl-2 mt-2">{item.deliverableCreatorUser.group && item.deliverableCreatorUser.group.name}</small>}
                        </div>
                    </div>}

                    {item.referenceType === 'project' &&
                    <div className="flex align-items-center">
                        <div>
                            <span>{_.find(referenceScopes, {"code": item.referenceType})["name"]}
                                : {project.name}
                            </span>
                        </div>
                        {/*<div className="ml-2">*/}
                        {/*    <span className='bx bx-timer text-grey-6'></span>*/}
                        {/*    <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>*/}
                        {/*    <span>{CommonFunction.formatDate(project.endDate)}</span>*/}
                        {/*</div>*/}
                    </div>
                    }
                    {item.referenceType === 'phase' &&
                    <div className="flex align-items-center">
                        <div>
                            <span>{_.find(referenceScopes, {"code": item.referenceType})["name"]}
                                : {item.referencePhase.name}
                            </span>
                        </div>
                        <div className="ml-2">
                            <span className='bx bx-timer text-grey-6'></span>
                            <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>
                            <span>{CommonFunction.formatDate(item.referencePhase.endDate)}</span>
                        </div>
                    </div>
                    }
                    {/*{item.referenceType === 'work-package' &&*/}
                    {/*<div className="p-field">*/}
                    {/*    <div>*/}
                    {/*        <b>{_.find(referenceScopes, {"code": item.referenceType})["name"]}*/}
                    {/*            : {item.referenceWorkPackage.name}*/}
                    {/*        </b>*/}
                    {/*    </div>*/}
                    {/*    <div className="ml-2">*/}
                    {/*        <span className='bx bx-timer text-grey-6'></span>*/}
                    {/*        <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>*/}
                    {/*        <span>{CommonFunction.formatDate(item.referenceWorkPackage.endDate)}</span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*}*/}
                    {item.referenceType === 'task' &&
                    <>
                        <div>
                            <span>{_.find(referenceScopes, {"code": item.referenceType})["name"]}
                                : {item.referenceTask.name}
                            </span>
                        </div>
                        <div className="ml-2">
                            <span className='bx bx-timer text-grey-6'></span>
                            <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>
                            <span>{CommonFunction.formatDate(item.referenceTask.deadline)}</span>
                        </div>
                    </>
                    }
                </div>
            </div>
        )
    }

    const selectedItemTemplate = (item) => {
        return (
            <div>
                <div className={classNames({"dense flex align-items-center":true, "pl-2": true, "p-text-line-through": (!item.state || item.state === 'cancelled') })} >
                    {/* deliverable name */}
                    <div>
                        <span >
                            <b className="link-button mr-3">{item.name}</b>
                        </span>
                    </div>
                    {/* time */}
                    <div >
                        <span className='bx bx-timer text-grey-6'></span>
                        <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>
                        <span>{CommonFunction.formatDate(item.deadline)}</span>
                    </div>
                </div>
                <div className="flex">
                    {item.deliverableCreatorUser && <div className="flex mt-1 mr-2">
                        <div className="flex">
                            <Chip label={item.deliverableCreatorUser.fullName}
                                  image={CommonFunction.getImageUrl(item.deliverableCreatorUser.avatar, item.deliverableCreatorUser.fullName)}
                                  className="tiny text-ellipsis task-page-responsible-by-user-tooltip" />
                            {item.deliverableCreatorUser.group && <small className="pl-2 mt-2">{item.deliverableCreatorUser.group && item.deliverableCreatorUser.group.name}</small>}
                        </div>
                    </div>}

                    {item.referenceType === 'project' &&
                    <div className="flex align-items-center">
                        <div>
                            <span>{_.find(referenceScopes, {"code": item.referenceType})["name"]}
                                : {project.name}
                            </span>
                        </div>
                        {/*<div className="ml-2">*/}
                        {/*    <span className='bx bx-timer text-grey-6'></span>*/}
                        {/*    <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>*/}
                        {/*    <span>{CommonFunction.formatDate(project.endDate)}</span>*/}
                        {/*</div>*/}
                    </div>
                    }
                    {item.referenceType === 'phase' &&
                    <div className="flex align-items-center">
                        <div>
                            <b>{_.find(referenceScopes, {"code": item.referenceType})["name"]}
                                : {item.referencePhase.name}
                            </b>
                        </div>
                        <div className="ml-2">
                            <span className='bx bx-timer text-grey-6'></span>
                            <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>
                            <span>{CommonFunction.formatDate(item.referencePhase.endDate)}</span>
                        </div>
                    </div>
                    }
                    {/*{item.referenceType === 'work-package' &&*/}
                    {/*<div className="flex">*/}
                    {/*    <div>*/}
                    {/*        <b>{_.find(referenceScopes, {"code": item.referenceType})["name"]}*/}
                    {/*            : {item.referenceWorkPackage.name}*/}
                    {/*        </b>*/}
                    {/*    </div>*/}
                    {/*    <div className="ml-2">*/}
                    {/*        <span className='bx bx-timer text-grey-6'></span>*/}
                    {/*        <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>*/}
                    {/*        <span>{CommonFunction.formatDate(item.referenceWorkPackage.endDate)}</span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*}*/}
                    {item.referenceType === 'task' &&
                    <>
                        <div>
                            <span>{_.find(referenceScopes, {"code": item.referenceType})["name"]}
                                : {item.referenceTask.name}
                            </span>
                        </div>
                        <div className="ml-2">
                            <span className='bx bx-timer text-grey-6'></span>
                            <span className="ml-1 text-grey-8">{`${t("task.due")}: `}</span>
                            <span>{CommonFunction.formatDate(item.referenceTask.deadline)}</span>
                        </div>
                    </>
                    }
                </div>

            </div>
        )
    }

    return (
        <XAutoComplete
            // complete method: search data
            // paging: { page: 0, search: "what user's typed", size: 10}
            // params: whatever pass to XAutoComplete is params props
            completeMethod={async (paging, params) => {
                let result = null;
                let res = null;

                res = await ProjectService.searchDeliverable({
                    ...paging,
                    filter: paging.search,
                    projectId: project.id,

                });

                if (res && res.content && res.content.length > 0) {
                    if(states && states.length > 0){
                        _.remove(res.content, function(r){
                            return r.state && _.indexOf(states, r.state) < 0
                        });
                    }

                    result = {
                        data: res.content,
                        page: res.page,
                        size: res.pageSize,
                        total: res.total
                    }
                }

                return result;
            }}
            value={value}
            disabled={disabled}
            onChange={onChange}
            className={className}
            itemTemplate={(item) => itemTemplate(item)}
            selectedItemTemplate={(item) => selectedItemTemplate(item)}
        />
    )
}
