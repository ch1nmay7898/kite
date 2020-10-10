import React, { useEffect, useRef, useState } from "react";
import { gsap, Draggable } from "gsap/all";

import cardChooser from "./cardChooser";

import "../../../styles/Cards/GenericCard.scss";

/**
 * TODO :-
 * Check Multiple Uploaded File Renders in single card
 * Files Card Having Different Name ...Correction Needed
 */

// register gsap plugin so it doesn't get discarded during tree shake
gsap.registerPlugin(Draggable);

// wrapper for CardType that abstracts away some functionality common to all CardTypes
function GenericCard(props) {

    let [isActive, setActive] = useState(false)
    let [isDragging, setDragging] = useState(false)
    let CardType = cardChooser(props.card?.type, props.isLocked);
    let cardRef = useRef(null);
    // if size changes, animate it
    useEffect(
        () => { gsap.to("#".concat(props.id), { ...props.card.size, duration: 0.3 }) },
        [props.card.size.height, props.card.size.width]
    )
    useEffect(
        () => { gsap.set("#".concat(props.id), { opacity: 1, ...props.card.position }) }
        , [props.id, props.card.position])
    useEffect(
        () => {
            // warning: can't use arrow functions here since that messes up the "this" binding
            function drag() {
                console.log("now that was a drag");
                // this.update();
            }
            function dragStop() {
                setDragging(false);
                props.genericAPI.savePosition(props.id, { x: this.x, y: this.y });
            }
            let y = Draggable.create(
                "#".concat(props.id),
                {
                    autoScroll: 1,
                    trigger: "#".concat(props.id),
                    dragClickables: !isActive,
                    onClick: () => { cardRef.current.focus(); setActive(true); },
                    onDragStart: () => setDragging(true),
                    onDrag: drag,
                    onDragEnd: dragStop,
                    cursor: "grab",
                    activeCursor: "grabbing"
                })
            return () => y[0].kill()
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isActive]
    )

    return (
        <div id={props.id} tabIndex={0} className={(isActive ? "generic-card active-card" : "generic-card") + (isDragging ? " dragging-card" : "")}
            ref={cardRef}
            onFocus={() => setActive(true)}
            onBlur={() => { console.log("called blur"); setActive(false) }}
            style={{
                position: "absolute",
                opacity: 0
            }}>
            {/* <div id={"handle".concat(props.id)} className="card-handle card-title-bar">
                <img alt="drag icon" src={require("../../../assets/drag-indicator.svg")} />
            </div> */}
            <div style={{ width: "100%", height: props.card.size.height, position: "absolute", top: 0 }}>
                <CardType typeAPI={props.typeAPI} content={props.card.content} size={props.card.size} id={props.id} isLocked={props.isLocked} />
            </div>
        </div>
    )
}

export default React.memo(GenericCard);