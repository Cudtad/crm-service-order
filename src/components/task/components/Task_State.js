import React from "react"
import Badges from '@ui-lib/badges/Badges';
import Enumeration from '@lib/enum';
import CommonFunction from '@lib/common'


function Task_State(props, ref) {
    const t = CommonFunction.t;
    const { state, className, style, children, span, onClick, title, short } = props;

    const stateColor = () => {
        let color = "grey";
        switch (state) {
            // Đang xử lý
            case Enumeration.task.state.inProgress:
                color = "green";
                break;
            // Hoàn thành
            case Enumeration.task.state.completed:
                color = "orange";
                break;
            // Xem xét
            case Enumeration.task.state.reviewing:
                color = "purple";
                break;
            // Bị trì hoãn
            case Enumeration.task.state.deferred:
                color = "red";
                break;
            // Huỷ bỏ
            case Enumeration.task.state.canceled:
                color = "magenta";
                break;
            // Chờ xử lý
            case Enumeration.task.state.pending:
                color = "grey"
                break;
            // Đã duyệt
            case Enumeration.task.state.accepted:
                color = "blue"
                break;
            // Đã tiếp nhận
            case Enumeration.task.state.response:
                color = "purple"
                break;
            // Đang đánh giá
            case Enumeration.task.state.evalution:
                color = "purple";
                break;
            // Mới
            case Enumeration.task.state.init:
                color = "green";
                break;
            // Thực hiện lại
            case Enumeration.task.state.reprocess:
                color = "purple";
                break;
            // Mở lại
            case Enumeration.task.state.reopen:
                color = "orange";
                break;
            // Đã xử lí
            case Enumeration.task.state.solved:
                color = "purple";
                break;
            default:
                break;
        }

        return color;
    }

    return (
        <Badges
            pill
            soft
            span={span ? true : false}
            className={className || ""}
            style={style || (short ? { width: "70px" } : null)}
            color={stateColor()}
            onClick={onClick}
            title={title}
        >
            {children}
        </Badges>
    );
}

export default Task_State;
