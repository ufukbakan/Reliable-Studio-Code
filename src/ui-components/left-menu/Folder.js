import React, { useState } from 'react'
import { classListToString, sortFiles, toggleClassList } from '../../renderer-operations/rendererUtilities';
import File from './File';

export default function Folder(props) {

    const [classList, setclassList] = useState(["folder"]);

    function calculateFilesJSX() {
        return props.files.sort(sortFiles).map(f =>
            <File level={props.level} file={f} openTab={props.fileReqFunc[0]} removeFile={props.fileReqFunc[1].bind(this,f)} ></File>
        );
    }

    function hideFiles() {
        setclassList(toggleClassList(classList, "hide-files"));
    }

    return (
        <div className={classListToString(classList)} style={{backgroundPositionX: (1*props.level)+"em"}}>
            <div className="folder-name" style={ {paddingLeft: (1*props.level)+"em"} } onClick={hideFiles}>{props.name}</div>
            {calculateFilesJSX()}
        </div>
    )
}
