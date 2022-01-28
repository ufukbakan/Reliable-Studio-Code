import React from 'react';

function DummyEditor(props) {
    return (
        <div className='dummy-editor'>
            <span className='dummy-content'>{props.value}</span>
        </div>
    );
}

export default DummyEditor;