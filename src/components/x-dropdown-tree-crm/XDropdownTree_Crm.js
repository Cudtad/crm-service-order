import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import _ from "lodash";
import classNames from 'classnames';
import "./scss/XDropdownTree.scss";
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
/**
 * props:
 *      options: [], // drop down options]
 *      treeConfig: { idProp: "id", parentIdProp: "parentId" }
 *      afterBindData: () => {} // after data bind
 * @param {*} props
 * @param {*} ref
 * @returns
 */
function XDropdownTree_Crm(props, ref) {
    const { options, treeConfig, itemTemplate, optionLabel, panelClassName, filterBy, multiple, ignoreNodes, afterBindData } = props;
    const [dropdownOptions, setDropdownOptions] = useState([]);


    const listToFlatTree = (list, idProp, parentIdProp, combineProps) => {
        let map = {};

        const combineObjectProps = (_object, _properties) => {
            let values = [];
            _properties.forEach(p => {
                if (_object[p]) {
                    values.push(_object[p].toString());
                }
            })

            return values.join(" ").toLowerCase();
        }

        // map id and index
        for (let i = 0; i < list.length; i += 1) {
            map[list[i][idProp]] = i; // initialize the map
        }

        let unprocessedNodes = [], previousParentIds = {}, rootIndex = 1;

        // prepare root nodes
        list.forEach((node, index) => {
            if (!node[parentIdProp]) {
                node._treePath = `000000${rootIndex}`.slice(-6);
                node._idPath = node[idProp].toString();
                node._treeLevel = 0;
                node._parentsPosition = []; // all parents from root to this node
                node._parents = [];
                node._descendantsCount = 0;

                previousParentIds[node[idProp]] = {
                    path: node._treePath,
                    idPath: node._idPath,
                    child: 0, // increasement child
                    lastChild: null,
                    parents: node._parents
                }
                rootIndex += 1;
            } else {
                unprocessedNodes.push(_.cloneDeep(node));
            }
        });
        // loop max 10 level of tree
        for (let level = 0; level < 10; level++) {
            if (unprocessedNodes.length === 0) {
                // break if all nodes 're processed
                break;
            } else {
                let nextLevelNodes = [], nextLevelParentIds = {};

                unprocessedNodes.forEach(node => {
                    if (previousParentIds[node[parentIdProp]]) {
                        // found current level node
                        previousParentIds[node[parentIdProp]].child += 1; // increase child
                        previousParentIds[node[parentIdProp]].lastChild = node[idProp];

                        let _treePath = previousParentIds[node[parentIdProp]].path + "_" + `000000${previousParentIds[node[parentIdProp]].child}`.slice(-6);
                        let _idPath = previousParentIds[node[parentIdProp]].idPath + "_" + node[idProp];
                        // parents of this node
                        let _parents = [...previousParentIds[node[parentIdProp]].parents, node[parentIdProp]];
                        // add decendants count of parents node
                        for (let i = 0; i < _parents.length; i++) {
                            let _p = list[map[_parents[i]]];
                            if (_p) {
                                _p._descendantsCount += 1;
                            }
                        }

                        nextLevelParentIds[node[idProp]] = {
                            path: _treePath,
                            idPath: _idPath,
                            parents: _parents,
                            child: 0, // increasement child
                            lastChild: null
                        }

                        // apply to main list
                        let nodeInList = list[map[node[idProp]]];
                        nodeInList._treePath = _treePath;
                        nodeInList._idPath = _idPath;
                        nodeInList.parents = _parents;
                        nodeInList._treeLevel = level + 1;
                        nodeInList._parentsPosition = [...list[map[node[parentIdProp]]]._parentsPosition, map[node[parentIdProp]]];
                    } else {
                        // this node is under level
                        nextLevelNodes.push(node);
                    }
                });

                // mark last child
                for (const key in previousParentIds) {
                    if (previousParentIds[key].lastChild) {
                        list[map[previousParentIds[key].lastChild]]._lastChild = true;
                    }
                }

                // prepare for next level
                unprocessedNodes = nextLevelNodes;
                previousParentIds = nextLevelParentIds;
            }
        }

        // order by tree path
        let _orderedList = _.orderBy(list, ["_treePath"]);

        // re-calculate last child position (for draw tree branch)
        prepareNodeBranch(_orderedList);

        // prepare combine data
        _orderedList.forEach(node => {
            node._treeFilter = combineObjectProps(node, combineProps);

            if (node._parentsPosition) {
                node._parentsPosition.forEach(parentIndex => {
                    list[parentIndex]._treeFilter += " " + node._treeFilter;
                });
            } else {
                // console.log("listToFlatTree: node parent's not exists", node);
            }

            delete node._parentsPosition;
        });

        return _orderedList;
    }

    /**
     * prepare node's branch
     */
    const prepareNodeBranch = (_list) => {
        let idProp = "id", parentIdProp = "parentId";
        if (treeConfig) {
            if (treeConfig.idProp) idProp = treeConfig.idProp;
            if (treeConfig.parentIdProp) parentIdProp = treeConfig.parentIdProp;
        }
        let _map = {};
        for (let i = 0; i < _list.length; i += 1) {
            _map[_list[i][idProp]] = i; // initialize the map
            _list[i]._index = i;
            _list[i]._isParent = false;
        }

        // mark isParent and calculate branch height
        _list.forEach(node => {
            if (node[parentIdProp]) {
                let _p = _list[_map[node[parentIdProp]]];
                if (_p) {
                    _p._lastChildIndex = node._index;
                    _p._branchHeight = _p._lastChildIndex - _p._index;
                    _p._isParent = true;
                }
            }
        });
    }

    /**
     * prepare option
     */
    useEffect(() => {
        if (options && Array.isArray(options) && options.length > 0) {
            // default config
            let config = {
                idProp: "id",
                parentIdProp: "parentId"
            }

            // apply tree config
            if (treeConfig) {
                if (treeConfig.idProp) config.idProp = treeConfig.idProp;
                if (treeConfig.parentIdProp) config.parentIdProp = treeConfig.parentIdProp;
            }

            // prepare filter
            let filterProps = [optionLabel || "value"];
            if (filterBy) {
                filterProps = filterBy.split(",");
                for (let i = 0; i < filterProps.length; i++) {
                    filterProps[i] = filterProps[i].trim();
                };
            }

            // build flat tree
            let _options = listToFlatTree(options, config.idProp, config.parentIdProp, filterProps);

            // ignore nodes
            if (ignoreNodes && Array.isArray(ignoreNodes) && ignoreNodes.length > 0) {
                let regex = new RegExp(`(_|^)(${ignoreNodes.join("|")})(_|$)`); // regex filter nodes with path contains ignore nodes
                _options.forEach(el => {
                    el._ignore = regex.exec(el._idPath) !== null;
                });
                _options = _options.filter(f => !f._ignore);
            }

            // console.log(_options);
            setDropdownOptions(_options);

            if (afterBindData && typeof afterBindData === "function") {
                afterBindData(_options);
            }

        } else {
            if (dropdownOptions.length > 0) {
                setDropdownOptions([]);
            }
        }
    }, [options]);

    /**
     * on filter change
     */
    const onFilterChange = (e) => {
        let filterKey = e.filter.trim().toLowerCase();
        let _options = _.cloneDeep(dropdownOptions);
        if (filterKey) {
            let _filteredOptions = _options.filter(f => f._treeFilter.indexOf(filterKey) > -1);
            _filteredOptions.forEach(o => {
                o._isParent = false;
            });
            prepareNodeBranch(_filteredOptions);
            setDropdownOptions(_options);
        } else {
            prepareNodeBranch(_options);
            setDropdownOptions(_options);
        }
    }

    /**
     * render item
     */
    const renderItemTemplate = (item) => {
        let style = { marginLeft: `${item._treeLevel * 20}px` }

        return (
            <div
                className={classNames({
                    "x-dropdown-tree-sub-level": item._treeLevel > 0,
                    "last-child": item._lastChild === true,
                    "x-dropdown-tree-parent": item._isParent === true
                })}
                style={style}
            >
                <div className="x-dropdown-tree-value"> {item[optionLabel || "value"]} </div>
                {item._isParent &&
                    <div className="x-dropdown-tree-branch" style={{ height: `calc(${item._branchHeight * 100 - 50}% + 1px)` }}></div>
                }
            </div>
        )
    }

    if (multiple) {
        return (
            <MultiSelect
                {...props}
                filter
                filterBy="_treeFilter"
                display="chip"
                onFilter={onFilterChange}
                options={dropdownOptions}
                itemTemplate={itemTemplate || renderItemTemplate}
                panelClassName={`x-dropdown-tree-panel ${panelClassName || ""}`}
            />
        )
    } else {
        return (
            <Dropdown
                {...props}
                filter
                filterBy="_treeFilter"
                onFilter={onFilterChange}
                options={dropdownOptions}
                itemTemplate={itemTemplate || renderItemTemplate}
                panelClassName={`x-dropdown-tree-panel ${panelClassName || ""}`}
            />
        )
    }
}

XDropdownTree_Crm = forwardRef(XDropdownTree_Crm);

export default XDropdownTree_Crm;
