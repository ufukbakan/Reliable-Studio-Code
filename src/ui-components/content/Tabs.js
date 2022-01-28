import React, { useEffect, useState } from 'react';
import { getFullPathFromFileObj } from '../../renderer-operations/rendererUtilities';
import Tab from './Tab';

export default function Tabs(props) {

    const [maxTabWidth, setMaxTabWidth] = useState(calculateMaxTabWidth());

    useEffect(()=>{
        setMaxTabWidth(calculateMaxTabWidth());
    },[props.tabs]);

    function calculateMaxTabWidth(){
        return ((100) / props.tabs.length)+"%";
    }

    window.addEventListener("resize",()=>setMaxTabWidth(calculateMaxTabWidth()));

    function closeSpecificTab(tabFile){
        let newTabs = [...props.tabs];
        newTabs = newTabs.filter( t => (t.fileName != tabFile.fileName) || (t.directory != tabFile.directory) || (t.isEncoded != tabFile.isEncoded));
        props.setTabs(newTabs);
    }

    function renderTabs(){
        let render = [];
        for(let file of props.tabs){
            render.push(<Tab maxWidth={maxTabWidth} onClose={closeSpecificTab} onClick={props.openTab} open={props.activeTab == file} refFile={file}></Tab>)
        }
        return render;
    }

    return (
        <div className='tabs'>
            {renderTabs()}
        </div>
    )
}
