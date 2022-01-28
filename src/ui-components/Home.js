import React, { useState, useEffect } from 'react';
import { areObjectsEqual, calculateLevelOfFolder, DoesArrContainObj, encodedExtensions, getFolderName, getFullPathFromFileObj, removeObjectFromArray, sortFolders } from '../renderer-operations/rendererUtilities';
import "../static/global-style.css";
import Folder from './left-menu/Folder';
import Tabs from './content/Tabs';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/ext-language_tools";
import DummyEditor from './content/DummyEditor';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { MdCached } from 'react-icons/md';
import { decode, encode } from '../renderer-operations/encoderDecoder';
import { readFile, writeFile } from '../renderer-operations/readerWriter';
import { alert, prompt } from 'smalltalk';

export default function Home(props) {

    const ipcRenderer = window.electron.ipcRenderer;
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [code, setCode] = useState("");
    const [cipherText, setCipherText] = useState("");
    const [tabs, setTabs] = useState([]);
    const [fileCaches, setFileCaches] = useState([]);
    const [activeTab, setActiveTab] = useState(undefined);
    const [showDummyEditor, setShowDummyEditor] = useState(false);
    const [lastSecretKey, setLastSecretKey] = useState("");

    function openTab(file) {
        if (!tabs.find(t => t.fileName == file.fileName && t.directory == file.directory && t.isEncoded == file.isEncoded)) {
            setTabs([...tabs, file]);
            updateEditor(file);
        } else {
            updateEditor(file);
        }
    }

    //Remove listeners on rerender to prevent memory leak :
    //ipcRenderer.removeAllListeners("say-hello");
    ipcRenderer.removeAllListeners("open-code-files");
    ipcRenderer.removeAllListeners("get-file-extension-and-save");
    ipcRenderer.removeAllListeners("save-encoded-file");

    ipcRenderer.on("open-code-files", (args) => {
        if (args.askKey) {
            prompt("", "Please enter the secret key", lastSecretKey, { type: "password" }).then(key => {
                setLastSecretKey(key);
                let newFiles = [...files];
                let newFolders = [...folders];
                for (let file of args.files) {
                    let fileWithKey = { ...file, key: key };
                    if (!DoesArrContainObj(newFiles, fileWithKey)) {
                        newFiles.push(fileWithKey);
                        if (!DoesArrContainObj(newFolders, file.directory)) {
                            newFolders.push(file.directory);
                        }
                    }
                }
                setFiles(newFiles);
                setFolders(newFolders);
            }).catch(() => {/* console.log("cancelled") */ });
        } else {
            let newFiles = [...files];
            let newFolders = [...folders];
            for (let file of args.files) {
                if (!DoesArrContainObj(newFiles, file)) {
                    newFiles.push(file);
                    //("found unpushed file")
                    if (!DoesArrContainObj(newFolders, file.directory)) {
                        newFolders.push(file.directory);
                    }
                }
            }
            setFiles(newFiles);
            setFolders(newFolders);
        }
    });

    ipcRenderer.on("save-encoded-file", (path) => {
        prompt("", "Please enter the secret key", lastSecretKey, { type: "password" }).then(key=>{
            setLastSecretKey(key);
            writeFile(path, encode(code, key));
        }).catch(() => {/* console.log("cancelled") */});
    });

    ipcRenderer.on("get-file-extension-and-save", () => {
        if (tabs.length > 0) {
            let splittedFileName = activeTab.fileName.split('.');
            let extension = splittedFileName[splittedFileName.length - 1];
            let newExtension = extension[0]!="s" ? "s" + extension : extension;
            let pureFileName = activeTab.fileName.replace("." + extension, "");
            ipcRenderer.send("show-save-dialog-with-args", [newExtension], pureFileName);
        }
        else {
            ipcRenderer.send("show-save-dialog-with-args", encodedExtensions, "Untitled");
        }
    });

    //ipcRenderer.on("say-hello", (msg) => { console.log(msg + " world!") });

    useEffect(() => {
        // Don't set ipc listeners here or lose your state
        setFiles(JSON.parse(window.localStorage.getItem("files")) || []);
        // Loading file cache is a bad idea:
        //setFileCaches(JSON.parse(window.localStorage.getItem("fileCaches")) || []);
        setFolders(JSON.parse(window.localStorage.getItem("folders")) || []);
        //setTabs(JSON.parse(window.localStorage.getItem("tabs")) || []);
        //setActiveTab(JSON.parse(window.localStorage.getItem("activeTab")) || undefined);
        setCode(JSON.parse(window.localStorage.getItem("code")) || "");
        setCipherText(JSON.parse(window.localStorage.getItem("encoded")) || "");
        setShowDummyEditor(JSON.parse(window.localStorage.getItem("splitEditor")) || false);
        setLastSecretKey(JSON.parse(window.localStorage.getItem("secretKey")) || "");

    }, [])

    useEffect(() => {
        window.localStorage.setItem("encoded", JSON.stringify(cipherText));
    }, [cipherText])

    useEffect(()=>{
        for(let i = 0; i < tabs.length; i++) {
            if(!files.includes(tabs[i])){
                setTabs(removeObjectFromArray(tabs,tabs[i]));
                break;
            }
        }
        for(let i = 0; i < folders.length; i++) {
            let emptyFolder = true;
            for(let j = 0; j < files.length; j++) {
                if(files[j].directory == folders[i]) {
                    emptyFolder = false;
                    break;
                }
            }
            if(emptyFolder){
                setFolders([...folders].filter(folder => folder != folders[i]));
            }
        }
        for(let i= 0; i<fileCaches.length; i++){
            let invalidCache = true;
            for(let j = 0; j < files.length; j++){
                if(fileCaches[i].path == getFullPathFromFileObj(files[j])){
                    invalidCache = false;
                }
            }
            if(invalidCache){
                setFileCaches(removeObjectFromArray(fileCaches,fileCaches[i]));
                break;
            }
        }
        window.localStorage.setItem("files", JSON.stringify(files));
    }, [files])

    useEffect(() => {
        if (!tabs.includes(activeTab) && tabs.length > 0) {
            setActiveTab(tabs[tabs.length - 1]);
            setCode(cacheAndGetContent(tabs[tabs.length - 1]));
        }
        if (tabs.length > 0 && !activeTab) {
            setActiveTab(tabs[0]);
        }
        else if (tabs.length == 0) {
            setActiveTab(undefined);
            setCode("");
        }
        window.localStorage.setItem("tabs", JSON.stringify(tabs));
    }, [tabs]);

    useEffect(() => {
        try {
            setCipherText(encode(code, lastSecretKey));
        }
        catch (ex) {
            console.log(ex.message);
        }
        window.localStorage.setItem("code", JSON.stringify(code));
    }, [code])

    useEffect(()=>{
       window.localStorage.setItem("folders", JSON.stringify(folders)); 
    }, [folders])

    useEffect(()=>{
        window.localStorage.setItem("fileCaches", JSON.stringify(fileCaches));
    }, [fileCaches])

    useEffect(()=>{
        if(activeTab && activeTab.key){
            setLastSecretKey(activeTab.key);
        }
        window.localStorage.setItem("activeTab", JSON.stringify(activeTab));
    }, [activeTab])

    useEffect(()=>{
        window.localStorage.setItem("splitEditor", JSON.stringify(showDummyEditor));
    }, [showDummyEditor])

    useEffect(()=>{
        window.localStorage.setItem("secretKey", JSON.stringify(lastSecretKey));
    }, [lastSecretKey])

    function cacheAndGetContent(file) {
        try {
            let path = getFullPathFromFileObj(file);
            let cache = fileCaches.find(fc => fc.path == path);
            let content = undefined;
            if (!cache) {
                //console.log("cache miss");
                content = file.isEncoded ? decode(readFile(path), file.key) : readFile(path);
                if (fileCaches.length < 3) {
                    setFileCaches([...fileCaches, {
                        path: path,
                        content: content
                    }]);
                }
                else {
                    let newFileCaches = [...fileCaches.slice(1)];
                    setFileCaches([...newFileCaches, {
                        path: path,
                        content: content
                    }]);
                }
            }
            else {
                //console.log("cache hit");
                content = cache.content;
            }
            //console.log(fileCaches);
            return content;
        }
        catch (ex) {
            alert("Error", ex.message).then(()=>{
                removeFile(file);
            }); 
        }
    }

    function removeFile(file){
        setFiles(removeObjectFromArray(files, file));
    }

    function updateEditor(file) {
        setCode(cacheAndGetContent(file));
        setActiveTab(file);
    }

    let renderHyerarchy = () => {
        return folders.sort(sortFolders).map(f =>
            <Folder level={calculateLevelOfFolder(f, folders)} name={getFolderName(f)} files={getFilesOfFolder(f)} fileReqFunc={[openTab,removeFile]}></Folder>
        )
    };

    function getFilesOfFolder(folder) {
        let result = [];
        files.forEach(file => {
            if (file.directory == folder)
                result.push(file)
        });
        return result;
    }

    function editorChange(changedCode) {
        setCode(changedCode);
    }

    function toggleEditorSplit() {
        setShowDummyEditor(!showDummyEditor);
    }

    function renderEye() {
        if (showDummyEditor) {
            return <HiEye />
        }
        else {
            return <HiEyeOff />
        }
    }

    function clearCache(){
        setFileCaches([]);
        updateEditor(activeTab);
    }

    return (
        <div className="screen">
            <div className="left-menu">
                {renderHyerarchy()}
            </div>
            <div className="content">
                <Tabs tabs={tabs} setTabs={setTabs} activeTab={activeTab} openTab={openTab}></Tabs>
                <div className={showDummyEditor ? "editor-screen split" : "editor-screen"}>
                    <div id='code-editor'>
                        <AceEditor
                            placeholder="Welcome to the Reliable Studio Code."
                            mode="javascript"
                            theme="tomorrow"
                            name="ace-editor"
                            width='100%'
                            height='100%'
                            onChange={editorChange}
                            fontSize={14}
                            showPrintMargin={true}
                            showGutter={true}
                            highlightActiveLine={true}
                            value={code}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                tabSize: 4,
                            }} />
                    </div>
                    <DummyEditor value={cipherText}></DummyEditor>
                </div>

            </div>
            <div className="toolbar">
                <div className='icon-button' onClick={toggleEditorSplit}>{renderEye()}</div>
                <br></br>
                <div className='icon-button' onClick={clearCache}><MdCached></MdCached></div>
            </div>
        </div>
    );
}
