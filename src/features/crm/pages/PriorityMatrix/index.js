import React, { useEffect, useRef, useState } from "react";
import "./styles.scss";

import { XLayout, XLayout_Center, XLayout_Top } from "@ui-lib/x-layout/XLayout";
import CommonFunction from "@lib/common";
import _ from "lodash";
import { useParams } from "react-router-dom";
import { CrmApplicationConfigApi } from "../../../../services/CrmApplicationConfig";
import CrmMatrixPrioritySetting from "../../components/CrmMatrixPrioritySetting";
import { getPermistion } from "../../utils";

const permissionCode = "crm-service-service_setting_priority-matrix"

export default function PriorityMatrix(props) {
	const t = CommonFunction.t;

	const [permission, setPermission] = useState()

	/**
	 * onetime
	 */
	useEffect(() => {
		// permission
		const _permission = getPermistion(window.app_context.user, permissionCode);
		setPermission(_permission)
	}, []);

	return (
		<>
			<XLayout className="p-2">
				<XLayout_Center>
					<CrmMatrixPrioritySetting
						updatePermission={permission?.update}
						getApi={CrmApplicationConfigApi.get}
						updateApi={CrmApplicationConfigApi.update}
					/>
				</XLayout_Center>
			</XLayout>
		</>
	);
}
