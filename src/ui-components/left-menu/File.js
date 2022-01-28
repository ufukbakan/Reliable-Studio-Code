import React from 'react'

export default function File(props) {

    function handleAuxClick(e){
        if(e.button == 1){ // middle click
            props.removeFile();
        }
    }

    return (
        <div onAuxClick={handleAuxClick} onClick={props.openTab.bind(this,props.file)} className="file" style={{ paddingLeft: (1 * props.level + 1) + "em" }}>
            {props.file.fileName}
        </div>
    )
}
