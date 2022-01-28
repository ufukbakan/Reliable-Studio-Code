import React, { useEffect, useState } from 'react'
import { classListToString } from '../../renderer-operations/rendererUtilities';

export default function Tab(props) {

    const [classList, setClasslist] = useState(["tab"]);

    useEffect(()=>{
        if(props.open){
            setClasslist(["tab", "active"]);
        }
        else{
            setClasslist(["tab"]);
        }
    },[props.open]);

    function handleAuxClick(e){
        if(e.button == 1){
            props.onClose(props.refFile);
        }
    }

    function handleCloseClick(e){
        props.onClose(props.refFile);
    }

    function handleClick(e){
        if(e.target.classList.contains("tab")){
            props.onClick(props.refFile);
        }
    }

    return (
        <div className={classListToString(classList)} onAuxClick={handleAuxClick} onClick={handleClick} style={{maxWidth: props.maxWidth}}>
            <div className='close-button tab-hover-button' onClick={handleCloseClick}>&times;</div>
            {props.refFile.fileName}
        </div>
    )
}
