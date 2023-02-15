import CommonFunction from "@lib/common";
import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import "./styles.scss";
import { Card } from "primereact/card";
import XToolbar from "../../../../components/x-toolbar/XToolbar";
import { Toolbar } from "primereact/toolbar";
import {Button} from "primereact/button";

export default function CrmNavigation(props) {
  const t = CommonFunction.t;
  const { screenTitle, title, path, right, info, icon } = props;

  const [other, setOther] = useState([]);

  useEffect(() => {
    if (info && info.length && info.length < 6) {
      let _other = [];
      for (let i = 0; i < 6 - info.length; i++) {
        _other.push(i);
      }
      setOther(_other);
    } else {
      setOther([]);
    }
  }, [info]);

  const renderIcon = icon && typeof icon === "function" && icon();

  const leftContents = (
    <div className="flex align-items-center">
      <div className="">{renderIcon}</div>
      <div className="pl-2">
        <div className="h-100">
          {screenTitle ? <div className="mb-0 fs-14">{screenTitle}</div> : null}

          <div className="fs-16 font-semibold">{title}</div>
        </div>
      </div>
    </div>
  );

  const rightContents = right && typeof right === "function" && right();

  const renderInfo = (item, index) => {
    return (
      <div className="col" key={index}>
        <p className="mt-0 mb-1 text-sm info">{item.label}</p>
        <p className={`my-0 info ${item.isConvert === 1 ? "c-button-convert" : ""}`}>
          {item.value}
          {item.isConvert === 1?
              <Button tooltip={t("crm-sale.lead.convert")} style={{ minWidth:'0', background:'none' , width:'auto' }} >
                <i className='bx bx-log-in-circle' style={{color:'#2196f3'}} ></i>
              </Button> : null
          }
        </p>
      </div>
    );
  };

  const renderNothingInfo = (item, index) => {
    return <div className="col" key={index}></div>;
  };

  return (
    <div className="border-round crm-navigation shadow-4 overflow-hidden">
      <Toolbar
        left={leftContents}
        right={rightContents}
        className="page-navigation-tool-bar"
      />
      {info && info.length ? (

        <div className="p-fluid fluid formgrid grid py-2 px-3 bg-white">
          {info.map(renderInfo)}
          {other.map(renderNothingInfo)}
        </div>
      ) : null}
    </div>
  );
}
