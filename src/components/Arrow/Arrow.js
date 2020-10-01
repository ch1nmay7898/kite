import React, { useState, useEffect } from "react";
import { gsap, Draggable } from "gsap/all";

gsap.registerPlugin(Draggable)

/**
 * connects a child and a parent. lets the user assign a new parent for the child.
 * @param {*} props - id, head, tail
 */
function Arrow(props) {
    let [dragging, setDragging] = useState(false);

    useEffect(() => {
        let y = Draggable.create("#nub".concat(props.id),
            {
                type: "top,left",
                activeCursor: "grab",
                onDragStart: function () {
                    gsap.set("#nub".concat(props.id), { left: props.tail.x - 100, top: props.tail.y - 5 });
                    console.log(y);
                    console.log("start coords", this.x, this.y)
                },
                onDrag: function () {
                    setDragging({ x: this.x, y: this.y })
                },
                onDragEnd: function () {
                    // do a hittest
                    // if valid parent make the connection
                    // if not valid, do nothing
                    props.hits.forEach(cardID => {
                        if (y[0].hitTest("#".concat(cardID))) {
                            console.log("i hit", cardID)
                        }
                    });
                    setDragging(false)
                    console.log("end coords", this.x, this.y)
                },
            })
        return () => y[0].kill()
    }, [props.hits])

    let path;

    if (dragging) {
        path = updatePath(dragging.x, dragging.y, props.tail.x + 0, props.tail.y)
    }
    else {
        path = updatePath(props.head.x + 0, props.head.y + 0, props.tail.x + 0, props.tail.y - 5)
    }

    function updatePath(x1, y1, x4, y4) {
        // Amount to offset control points
        var bezierWeight = 0.3;

        var dx = Math.abs(x4 - x1) * bezierWeight;
        var x2 = x1 - dx;
        var x3 = x4 + dx;
        return `M${x1} ${y1} C ${x2} ${y1} ${x3} ${y4} ${x4} ${y4}`;
    }

    return (
        <div>
            <svg style={{ position: "absolute", height: 0, width: 0, overflow: "visible" }}>
                <path
                    strokeWidth="3"
                    fill="none"
                    stroke="red"
                    d={path} />
                <circle
                    id={"nub"}
                    cx={props.tail.x + 0}
                    cy={props.tail.y - 5}
                    r="5"
                    fill="yellow" />
            </svg>
            <svg style={{ position: "absolute", height: 0, width: 0, overflow: "visible" }}>
                <circle
                    style={{ position: "absolute" }}
                    id={"nub".concat(props.id)}
                    cx={dragging ? dragging.x : props.tail.x + 0}
                    cy={dragging ? dragging.y : props.tail.y - 5}
                    r="5"
                    fill="blue" />
            </svg>
        </div>
    )
}

export default React.memo(Arrow)