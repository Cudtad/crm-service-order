import CommonFunction from '@lib/common';
                    import { XLayout, XLayout_Box, XLayout_Center, XLayout_Title, XLayout_Top } from '@ui-lib/x-layout/XLayout';
import Enumeration from '@lib/enum';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { TabPanel, TabView } from 'primereact/tabview';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import XPerson_Personal_Info from './components/XPerson_Personal_Info';
import "./scss/XPerson.scss";

/**
 * props
 *      dialog: true, // use dialog or not, default true
 *      createConfig: { modules: ["person"], modulesDefinition: { person: {renderer: () => {}, title: "", icon: "" } } } // config for create
 *      updateConfig: { modules: ["person"], modulesDefinition: { person: {renderer: () => {}, title: "", icon: "" } } } // config for update
 *      onSubmit: (person) => { } // overright submit
 *      afterCancelCreate: () => {} // function after cancel create
 *      globalInfo: (_employee) => (<></>)
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function XPerson_Detail_Crm(props, ref) {
    const {title, onSubmit, createConfig, updateConfig, dialog, afterCancelCreate } = props;

    const t = CommonFunction.t;

    const refEditMode = useRef(null);
    const [editMode, setEditMode] = useState(null);
    const [show, setShow] = useState(false);

    const defaultPerson = { id: null };
    const [activeTab, setActiveTab] = useState({ index: 0, code: null });
    const [person, setPerson] = useState(defaultPerson);
    const refTabs = useRef(null);

    useImperativeHandle(ref, () => ({
        /**
         * create
         */
        create: (_person) => {
            refEditMode.current = Enumeration.crud.create;
            setEditMode(Enumeration.crud.create);
            
            setPerson(Object.assign(defaultPerson, _person || {}))
            setTimeout(() => {
                if (!show) {
                    setShow(true);
                }
            }, 100);
        },

        /**
         * update
         */
        update: (_person) => {
            let tabs = buildTabs();
            refEditMode.current = Enumeration.crud.update;
            setEditMode(Enumeration.crud.update);
            if (!activeTab.code) {
                if(tabs && tabs.length > 0){
                    setActiveTab({ index: 0, code: tabs[0].code });
                }
            }
            setPerson(_person);
            setTimeout(() => {
                if (!show) {
                    setShow(true);
                }
            }, 200);
        },

        /**
         * delete
         * @param {*} _group
         */
        delete: (id) => {

        },

        /**
         * delete
         */
        hide: () => {
            hide()
        }
    }));

    /**
     * hide window detail
     */
    const hide = () => {
        setShow(false);
    };

    /**
     * cancel create
     */
    const cancelCreate = () => {
        if (afterCancelCreate && typeof afterCancelCreate === "function") {
            afterCancelCreate();
            hide();
        }
    }

    /**
     * submit create
     */
    const submitCreate = (isClosedDialog = false) => {
        if (onSubmit && typeof onSubmit === "function") {
           
            onSubmit(Enumeration.crud.create);

            // if(dialog && isClosedDialog && _person.errors.length <=0){
            //     setShow(false);
            // }
        }
    }

    /**
     * render create form
     */
    const renderCreateForm = () => {
        if (createConfig && createConfig.modules) {
            return (
                <XLayout_Box className="h-full bg-semi-transparent overflow-auto ">
                    {createConfig.modules.map((module, index) => (
                        <div key={index} className="x-person-create-module">
                            {createConfig.modulesDefinition && createConfig.modulesDefinition[module] && renderCreateModule_Custom(module, index)}
                        </div>
                    ))}
                    {!dialog && <>
                        <hr className="mb-2 mt-2" />
                        <div className="flex">
                            <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={submitCreate} />
                            <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text" onClick={cancelCreate} />
                        </div>
                    </>}
                </XLayout_Box>
            )
        }
    }

    /**
     * render create module: custom
     */
    const renderCreateModule_Custom = (_module, index) => {
        if (createConfig.modulesDefinition[_module].renderer && typeof createConfig.modulesDefinition[_module].renderer === "function") {
            return (<>
                <XLayout_Title
                    className={`person-block-title biggest ${index === 0 ? "mt-0" : ""}`}
                >
                    {createConfig.modulesDefinition[_module].title || "..."}
                </XLayout_Title>
                {createConfig.modulesDefinition[_module].renderer()}
            </>)
        } else {
            return <></>
        }
    }

    /**
     * active update tab
     * @param {*} e
     */
    const changeTab = (index, tabs) => {
        setActiveTab({ index: index, code: tabs[index].code });
    }

    /**
     * render tab content
     * @param {*} _module
     * @returns
     */
    const renderTabContent = (_module) => {
        switch (_module) {
            case "personal_info":
                return <XPerson_Personal_Info
                person={person}
                config={updateConfig && updateConfig.modulesDefinition && updateConfig.modulesDefinition[activeTab.code] ? updateConfig.modulesDefinition[activeTab.code].config : null}
            >
                {updateConfig.modulesDefinition[_module].renderer(person)}
            </XPerson_Personal_Info>
                
                break;
            default:
                if (updateConfig.modulesDefinition && updateConfig.modulesDefinition[_module]
                    && updateConfig.modulesDefinition[_module].renderer && typeof updateConfig.modulesDefinition[_module].renderer === "function") {
                    return updateConfig.modulesDefinition[_module].renderer(person);
                } else {
                    return <></>
                }
                break;
        }
    }

    /**
     * render update form
     */
    const renderUpdateForm = () => {
        if (updateConfig && updateConfig.modules.length > 0 && person && activeTab.code) {
            let tabs = buildTabs();
            return (<>

                <XLayout className="x-person-detail">
                    <XLayout_Top>
                        <div className="x-person-detail">
                            <div className="x-person-detail-tabs">
                                <div className="x-person-detail-global-info">
                                    {updateConfig && updateConfig.globalInfo && typeof updateConfig.globalInfo === "function" && updateConfig.globalInfo(person)}
                                </div>
                                {/* <TabMenu model={tabs} activeIndex={activeTab.index} onTabChange={(e) => changeTab(e)} scrollable /> */}
                                <TabView scrollable onTabChange={(e) => changeTab(e.index, tabs)} activeIndex={activeTab.index}>
                                    {tabs.map((tab, index) => (
                                        <TabPanel key={index} header={tab.label}></TabPanel>
                                    ))}
                                </TabView>
                            </div>
                        </div>
                    </XLayout_Top>
                    <XLayout_Center className="x-person-tab-content">
                        {renderTabContent(activeTab.code)}
                    </XLayout_Center>
                </XLayout>
            </>)
        } else {
            return <></>
        }
    }

    /**
     * build update tabs
     * @returns
     */
    const buildTabs = () => {
        if (!refTabs.current) {
            let tabs = refTabs.current || [];
            updateConfig.modules.forEach(_module => {
                if (_module) {
                    switch (_module) {
                        case "personal_info":
                            tabs.push({ label: updateConfig.modulesDefinition[_module].title || "...", code: _module });
                            break;
                        default:
                            if (updateConfig.modulesDefinition && updateConfig.modulesDefinition[_module]) {
                                tabs.push({ label: updateConfig.modulesDefinition[_module].title || "...", code: _module });
                            }
                            break;
                    }
                }
            });
            refTabs.current = tabs;
        }

        return refTabs.current;
    }

    if (show) {
        if (dialog) {
            return (
                <Dialog
                    header={title}
                    visible={show}
                    modal
                    className="wd-640-480"
                    onHide={hide}
                    maximized={editMode === Enumeration.crud.update}
                    footer={editMode === Enumeration.crud.create ?
                        <>
                            <Button label={t('common.cancel')} icon="bx bx-x" className="p-button-text" onClick={hide} />
                            <Button label={t('common.save')} icon="bx bxs-save" className="p-button-primary" onClick={()=>submitCreate(false)}/>
                            <Button label={t('common.save-close')} icon="bx bxs-save" className="p-button-primary" onClick={() => submitCreate(true)}/>
                        </> : <></>
                    }
                >
                    <XLayout>
                        <XLayout_Center>
                            {editMode === Enumeration.crud.create ? renderCreateForm() : renderUpdateForm()}
                        </XLayout_Center>
                    </XLayout>
                </Dialog>
            );
        } else {
            return editMode === Enumeration.crud.create ? renderCreateForm() : renderUpdateForm();
        }
    } else {
        return <></>
    }
};

XPerson_Detail_Crm = forwardRef(XPerson_Detail_Crm);

export default XPerson_Detail_Crm;
