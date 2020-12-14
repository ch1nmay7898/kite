import { Resizable } from "re-resizable";
import React, { useRef, useEffect } from "react";
// import { Resizable, ResizableBox } from 'react-resizable';
// import ResizePanel from "react-resize-panel";

import ReactQuill from "react-quill"
import 'react-quill/dist/quill.snow.css'
import './TextCard.scss';
function TextCard(props) {
    const quillRef = useRef(null);
    const me = props.typeAPI.cards[props.id];
    const pointerAtLast = () => {
        if (quillRef.current) {
            var quillEditor = quillRef.current.getEditor();
            const selectionIndex = quillEditor.getSelection()?.index;
            const totalTextLength = quillEditor.getText().length - 1;
            console.log(selectionIndex ? "Selection Index" : "LENGTh", selectionIndex)
            quillEditor.setSelection(selectionIndex ? selectionIndex : totalTextLength, 0);
        }
    }
    const pasteAtLast = (text) => {
        var quillEditor = quillRef.current.getEditor();
        const selectionIndex = quillEditor.getSelection().index;
        setTimeout(() => {
            quillEditor.setSelection(selectionIndex + text.length, 0);
        }, 1)
    }
    useEffect(() => {
        if (props.typeAPI.currentActive === props.id && quillRef.current) {
            quillRef.current.focus();
            if (me.editing && !me.editing[props.typeAPI.userID]) {
                var quillEditor = quillRef.current.getEditor();
                quillEditor.enable(false)
            }
        }
    }, [props.id, props.typeAPI.currentActive, me.editing, props.typeAPI.userID]);

    let modules = {
        toolbar: ['bold', 'italic', 'underline', 'strike']
    }

    const onChangeQuill = (value) => {
        if (me.editing && me.editing[props.typeAPI.userID]) {
            props.typeAPI.saveContent(props.id, { text: value || "" })
        }
    }
    const style = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "solid 1px #ddd",
        background: "#f0f0f0"
    }
    return (
        <div className="text-node" onPaste={(e) => { pasteAtLast(e.clipboardData.getData('Text')) }} style={{ overflowX: "hidden", overflowY: "auto", width: "100%", height: "100%" }}>
            <div class="wrap">
                <div class="resize horizontal">Resize me!</div>
                <div class="resize vertical">Resize me!</div>
                <div class="resize both">Resize me!</div>
            </div>
            <ReactQuill ref={quillRef}
                theme="snow"
                value={me.content.text}
                modules={modules}
                onFocus={pointerAtLast}
                onChange={(value) => onChangeQuill(value)} />
            <Resizable style={style}
                size={props.size}
                onResizeStart={(e, direction, ref, d) => console.log("SIZE ", d)}
                onResizeStop={(e, direction, ref, d) => console.log("SIZE ", d)}>SDS</Resizable>
        </div>
    )
}
export default TextCard;