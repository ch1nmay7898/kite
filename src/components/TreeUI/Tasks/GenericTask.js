import React, { useState } from 'react';
import TimeAgo from "react-timeago";
import Calendar from 'react-calendar';
//import ReactMarkdown from "react-markdown"
// import SearchElements from '../../../constants/searchTemplate';
import '../../../styles/Tasks/GenericTask.scss';
import 'react-calendar/dist/Calendar.css';
import TaskItem from './TaskItem';
// import { MentionsInput, Mention } from 'react-mentions'
const GenericTask = ({ id, detail, store }) => {
    const creatorPic = store.users[detail.creator].photoURL;
    const creatorName = store.users[detail.creator].name;
    const taskItemLength = Object.keys(detail.content).length;
    const [showDropDown, setShowDropDown] = useState(false);
    const [results, setResults] = useState({ matches: [], suggest: [], text: "" });
    const [pickDate, setPickDate] = useState(false);
    const taggedPerson = (userID) => {
        const taggedPersonInfo = store.users[userID];
        setShowDropDown(false);
        const updates = {};
        if (userID === detail.creator) {
            updates[`content/${showDropDown}/text`] = detail.content[showDropDown].text + 'me ';
        }
        else {
            updates[`content/${showDropDown}/text`] = detail.content[showDropDown].text + taggedPersonInfo.name.split(" ")[0] + " "
        }
        updates['tagged'] = detail.tagged ? [...detail.tagged, userID] : [userID]
        store.updateTask(id, userID, updates);
        setResults({ matches: [], suggest: [], text: "" });
    }
    const onKeyDown = (event, id) => {
        console.log("Key Pressed", event.key, event.keyCode);
        switch (event.keyCode) {
            case 50://@
                setShowDropDown(id);
                break;
            case 13://Enter
                setShowDropDown(false);
                break;
            case 8://BackSpace
                setShowDropDown(false);
                break;
            case 32://space
                setShowDropDown(false);
                // setResults({ matches: [], suggest: [], text: "" });
                break;
            default: break;
        }
        // if (showDropDown) {
        //     const searchObject = new SearchElements(['name']);
        //     const [result, suggestions] = searchObject.getTagResult(results.text + event.key, store.users);
        //     console.log("RESULT ", event.key, result , results.text + event.key);
        //     console.log("Suggestion", event.key, suggestions);
        //     setResults({ matches: result, suggest: suggestions, text: results.text + event.key });
        // }
    }
    const addDueDate = (date) => {
        const updates = {};
        Object.keys(detail.content)
            .forEach((taskItemID) => {
                updates[`content/${taskItemID}/status`] = 'pending';
            })
        updates['dueDate'] = date
        store.updateTask(id, null, updates);
        setPickDate(!pickDate);
    }
    return (
        <div className="generic-task" tabIndex={0} key={id} style={{ height: detail.height }}>
            <div className="task-info-head">
                <div className="partition">
                    <img className="creator-pic" src={creatorPic} alt="creator pic" />
                    <span className="creator-name">{creatorName.split(" ")[0]}</span>
                </div>
                <div className="partition">
                    {
                        !pickDate && detail.dueDate && (<div className="due-date">due <TimeAgo date={detail.dueDate} /></div>)
                    }
                    {
                        !detail.dueDate &&
                        <span style={{ padding: "8px" }} onClick={() => setPickDate(!pickDate)}>
                            Add Due Date
                        </span>
                    }

                    <span onClick={() => { store.removeTask(id) }}>Remove </span>
                </div>

            </div>
            {
                pickDate ?
                    <Calendar
                        className="pick-calendar"
                        onChange={(date) => addDueDate(date.valueOf())}
                        value={new Date()}
                        view="month"
                        minDate={new Date()}
                    />
                    : null
            }
            <div >
                {
                    !pickDate && Object.entries(detail.content)
                        .map(([taskItemID, taskItemDetail], index) =>
                            <TaskItem
                                taskItemDetail={taskItemDetail}
                                taskItemID={taskItemID}
                                index={index}
                                taskItemLength={taskItemLength}
                                onKeyDown={onKeyDown}
                                showDropDown={showDropDown}
                                store={store}
                                results={results}
                                taggedPerson={taggedPerson}
                                detail={detail}
                                id={id}
                            />
                        )
                }
            </div>
        </div >
    )
}

export default GenericTask