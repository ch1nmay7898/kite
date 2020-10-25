import { observer } from "mobx-react-lite";
import React from "react"
import { useStore } from "../../store/hook"
import Cursor from "./Cursor"

function CursorsList(props) {
    let store = useStore();
    return (
        <div className="cursors">
            {Object.keys(store.cursors)
                .filter(id => id !== store.currentUser.uid && (Date.now() - store.lastActive[id] < 60000))
                .map(id => <Cursor key={id} id={id} />)}
        </div>
    )
}

export default observer(CursorsList);

