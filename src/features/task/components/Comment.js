import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import MentionApi from "services/MetionService";
import CommonFunction from '@lib/common';

import Mentions from "../../../components/mention/Mentions";

import _ from 'lodash';
import UserApi from "services/UserService";

import "./scss/Comment.scss"
import {Tooltip} from "primereact/tooltip";
import appSettings from 'appSettings';


function Comment(props, ref) {
    const t = CommonFunction.t;
    const {referenceType, referenceId} = props
    const [comments, setComments] = useState(null);
    const [loading, setLoading] = useState(false);

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 5,
        page: 0,
    });

    const ds = useRef(null);

    useEffect(() => {
        if (referenceId) loadLazyData();
    }, [lazyParams]);


    const loadLazyData = () => {
        setLoading(true);
        // setComments(null);
        MentionApi.get({
            ...lazyParams,
            referenceType: referenceType ? referenceType : 'task',
            referenceId: referenceId
        }).then(async (data) => {
            if (data) {
                setComments(await rebind(data.content));
                setLoading(false);
            }
        })
    };

    /**
     * rebinding
     * @param {Array} arr
     */
    const rebind = async (arr) => {
        return await Promise.all(arr.map(async (obj) => {
            // get object
            return {
                ...obj,
                user: await UserApi.getById(obj.createBy)
            }
        }))
    };

    useImperativeHandle(ref, () => ({
        /**
         * reload
         */
        reload: () => {
            setLazyParams(lazyParams);
        },
        /**
         * add
         */
        add: async (_obj) => {
            // setLoading(true);
            let _comments = [
                (await rebind([_obj]))[0],
                ..._.cloneDeep(comments)
            ];
            setComments(_comments);
            // setLoading(false);
        },
    }));

    const itemTemplate = (data) => {
        return (
            // <>{data.content}</>

            <div className="grid nested-grid col-11 py-0">
                <div className="col-1 p-text-center">
                    <img style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '30px' }} src={CommonFunction.getImageUrl(data.user.avatar, data.user.fullName)} />
                </div>
                <div className="col-11">
                    <span className="p-float-label my-2">
                        <Mentions id="comment" disabled data={data.content} />
                    </span>
                    {/*<label htmlFor="comment" className="label-history">Ten</label>*/}
                </div>
            </div>

            // <div className="col-12" style={{ border: 'none' }}>
            //     <span className="p-float-label my-2">
            //         {/*<p id="description" className="p-ml-6">*/}
            //         {/*    {data.description}*/}
            //         {/*</p>*/}
            //         <InputTextarea id="description" value={data.description}
            //                        autoResize
            //                        disabled
            //                        style={{
            //                            paddingTop: '15px',
            //                            opacity: 1,
            //                            borderRadius: 10
            //                        }}
            //         />
            //         <label htmlFor="description" className="label-history">{
            //             <div style={{display:'flex', alignItems: 'center'}}>
            //                 {data.user.avatar && data.user.avatar != 'null' ?
            //                     <img style={{ width: '20px', borderRadius: '20px' }} src={`${appSettings.api.url}/storage/file/preview/${data.user.avatar}`} />
            //                     :
            //                     <img className="search-item" src={`https://ui-avatars.com/api/?background=random&name=${data.user.lastName}+${data.user.middleName}+${data.user.firstName}`} />
            //                 }
            //                 <div className="ml-1">
            //                     <p>{data.user.lastName + ' ' + data.user.middleName + ' ' + data.user.firstName}</p>
            //                 </div>
            //                 &nbsp; - &nbsp;
            //                 <>{CommonFunction.formatDateTime(data.createDate)}</>
            //                 &nbsp; - &nbsp;
            //                 <>{t('task.attachment.file.version')}: {data.versionNo}</>
            //             </div>
            //         }</label>
            //     </span>
            // </div>
        );
    };

    return (
        <div className="comment">
            {/*{loading && <div className="grid col-12 my-4">*/}
            {/*    <i className="pi pi-spin pi-spinner p-m-auto" style={{color: '#2196f3', fontSize: '30px'}}></i>*/}
            {/*</div>}*/}
            {comments && comments.map((comment, index) => {
                return (
                    <div key={index} className="grid p-0 mx-0">
                        <div className="col-1 pr-1 p-text-right">
                            <img style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '30px' }} src={CommonFunction.getImageUrl(comment.user.avatar, comment.user.fullName)} />
                        </div>
                        <div className="col-9 py-0 px-1 mb-2">
                            <span className="p-float-label">
                                <Mentions disabled data={comment.content} />
                                <label htmlFor="comment">
                                    <b style={{ float: 'left' }}>{`${comment.user.lastName} ${comment.user.middleName} ${comment.user.firstName}`}</b>
                                </label>
                                <Tooltip target=".comment-time" />
                                <p className="comment-time pl-2 pb-2 p-font-smaller" data-pr-tooltip={CommonFunction.formatDate(comment.createDate, 'DD/MM/YYYY HH:mm:ss')} data-pr-position="right" style={{ fontSize: '1rem', cursor: 'pointer' }}>{CommonFunction.getTimeAgo(new Date(comment.createDate), t)}</p>
                            </span>
                        </div>
                    </div>
                )
            })}
            {/*{!comments && <div className="grid nested-grid">*/}
            {/*    <div className="col-1 p-text-center">*/}
            {/*        /!*<img style={{ width: '30px', height: '30px', objectFit: 'contain', borderRadius: '30px' }} src={CommonFunction.getImageUrl(comment.user.avatar, comment.user.fullName)} />*!/*/}
            {/*    </div>*/}
            {/*    <div className="col-11">*/}
            {/*        <div className="grid">*/}
            {/*            <Skeleton width="100%" height="2rem" />*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*</div>}*/}
            <div className="grid">
                <div className="col-1 pr-1 p-text-right" />
                <div className="col-9 py-0 px-1 mb-2">
                    {loading && <i className="pi pi-spin pi-spinner mr-1" style={{ color: '#2196f3', fontSize: '10px' }}></i>}
                    <a href="javascript:void(0);"
                       className="p-font-smaller"
                       onClick={(e) => setLazyParams({ ...lazyParams, rows: lazyParams.rows + 5 })}>{t('comment.load-more')}</a>
                </div>
            </div>
        </div>
    );
};

Comment = forwardRef(Comment);

export default Comment;
