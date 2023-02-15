import "./scss/XKanban.scss"
import CommonFunction from '@lib/common';
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import React from "react";
import XErrorPage from "../x-error-page/XErrorPage";

/**
 * base on react-trello: https://github.com/rcdexta/react-trello
 * @param {*} props
 * @returns
 */
function XKanban(props) {
    const { handleDragEnd, data, onLaneScroll, components, className } = props;

    const onScroll = (e, laneId) => {
        if (e.target.scrollHeight - 50 < e.target.scrollTop + e.target.clientHeight && onLaneScroll && typeof onLaneScroll === 'function') {
            onLaneScroll(laneId)
        }
    }

    const onDragEnd = (result) => {
        if (handleDragEnd && typeof handleDragEnd === 'function') {
            handleDragEnd(result)
        }
    };

    try {
        if (data && components) {
            return (
                // <Board {...props} className={`x-kanban ${props.className || ""}`} />
                <div className={`x-kanban ${className || ""}`}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        {data && data.lanes && data.lanes.length > 0 && data.lanes.map(lane => {
                            return <div key={`lane_${lane.id}`}>
                                <section className="x-kanban-lane" title={lane.title}>
                                    {components && components["LaneHeader"] && components["LaneHeader"](lane)}
                                    <Droppable key={lane.id} droppableId={lane.id}>
                                        {(provided, snapshot) => (
                                            <div {...provided.droppableProps}
                                                 ref={provided.innerRef}
                                                 style={{
                                                     marginTop: 10,
                                                     width: 310,
                                                     background: snapshot.isDraggingOver ? 'lightblue' : '',
                                                     overflow: 'auto'
                                                 }}
                                                 onScroll={(e) => CommonFunction.debounce(250, () => onScroll(e, lane.id))}
                                            >
                                                {lane.cards && lane.cards.length > 0 && lane.cards.map((item, index) => (
                                                    <Draggable key={item.id} draggableId={`draggableId_${item.id}`} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div ref={provided.innerRef}
                                                                 {...provided.draggableProps}
                                                                 {...provided.dragHandleProps}
                                                                 style={{
                                                                     borderRadius: '8px',
                                                                     userSelect: 'none',
                                                                     margin: '0 0 8px 0',
                                                                     minHeight: '50px',
                                                                     backgroundColor: snapshot.isDragging ? '#263B4A' : lane.style.backgroundColor,
                                                                     ...provided.draggableProps.style
                                                                 }}
                                                                 className="flex flex-column"
                                                            >
                                                                {components && components["Card"] && components["Card"](item)}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </section>
                            </div>
                        })}
                    </DragDropContext>
                </div>
            )
        } else {
            return <></>;
        }
    } catch (error) {
        return <XErrorPage error={error}></XErrorPage>;
    }
}

export default XKanban;
