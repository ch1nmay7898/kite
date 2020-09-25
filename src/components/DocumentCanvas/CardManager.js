import React, { useState, useEffect, useRef } from "react";
import CardContainer from "./CardContainer";
import { firebaseDB, firebaseStorage } from "../../services/firebase";
/**
 * Business logic for all canvas operations. Provides and implements the TypeAPI and GenericAPI
 * @property {state} cards - stores the local state information for all the cards
 * @property {state} container - stores the width and height of the container  
 * @param {*} props 
 */
export default function CardManager(props) {
    // store container-related state
    const [container, setContainer] = useState({ width: 600, height: 800 });
    const containerRef = useRef({});
    containerRef.current = container;

    // store card-related state
    const [cards, setCards] = useState({});

    // "root/documents/projectID/nodes" reference in firebase db
    const projectRef = firebaseDB.ref("documents/" + props.projectID + "/nodes");

    // get initial firebase state and subscribe to changes
    // unsubscribe before unmount
    useEffect(() => {
        // TODO: split the nodes listener into separate ones for "child_added", 
        // "child_removed" and so on reduce size of snapshot received
        let projectRef = firebaseDB.ref("documents/" + props.projectID);
        projectRef.child("nodes").on("value", (snapshot) => {
            console.log("triggered node listener, received payload", snapshot.val());
            setCards(snapshot.val());
        });
        projectRef.child("center").on("value", (snapshot) => {
            console.log("triggered center location listener, received payload", snapshot.val());
            // setDocCenter(snapshot.val());
        });
        projectRef.child("container").on("value", (snapshot) => {
            console.log("triggered container size listener, received payload", snapshot.val());
            setContainer(snapshot.val());
        });
        return () => {
            projectRef.child("nodes").off();
            projectRef.child("center").off();
            projectRef.child("container").off();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * add a new card with the specified type, position, and parent
     * @param {{x: number, y: number}} position - the initial position of the card
     * @param {{width: number, height: number}} size - the initial size of the card
     * @param {string} parent - (optional) the id of the parent card. default: "root"
     * @param {string} type - (optional) the card type (e.g. "audio", "image", "text"). default: "blank"
     */
    const addCard = (position, size, parent, type) => {
        // schema for new card
        const newCard = {
            type: type || "blank",
            size: size,
            position: position,
            content: {
                text: `This is a ${type} Card`
            },
            parent: parent || "root"
        }

        // create new key for child in ".../nodes"
        let newCardKey = projectRef.push().key;

        // use that key to 
        // a) push the new card schema 
        // b) update the "children" property of parent
        let updates = {};
        updates[parent + "/children/" + newCardKey] = 1;
        updates[newCardKey] = newCard;
        projectRef.update(updates).then(console.log("Added a new child", newCardKey, "under", parent));

        // update local state
        setCards({
            ...cards,
            [newCardKey]: newCard,
            [parent]: {
                ...cards[parent],
                children: {
                    ...cards[parent]["children"],
                    [newCardKey]: 1
                }
            }
        });
    }

    /**
     * remove a card or a subtree from the document
     * @param {string} id - the card on which to perform the operaiton
     * @param {string} strategy - the deletion strategy "recursive" or "reparent"
     * @param {string} newParent - !only used with the `reparent` strategy! the card 
     * that will now become the parent of the immediate descendents of the deleted card
     * @todo remove all storage files associated with the deleted cards
     */
    const removeCard = (id, strategy, newParent) => {
        let updates = {};
        updates[id] = null;
        updates[cards[id]["parent"] + "/children/" + id] = null;

        /**
         * do a depth-first traversal of the subtree rooted at `id` and add
         * every element to updates{} for removal
         * @param {Array} stack 
         */
        const depthFirstTraversal = (stack) => {
            while (stack.length > 0) {
                let poppedID = stack.pop();
                updates[poppedID] = null;
                stack.concat(Object.keys(cards[poppedID]["children"]))
            }
        }

        switch (strategy) {
            case "recursive":
                depthFirstTraversal(Object.keys(cards[id]["children"]));
                break;
            case "reparent":
                Object.keys(cards[id]["children"])
                    .forEach(child => updates[child + "/parent"] = newParent);
                break;
            default:
                break;
        }

        projectRef.update(updates).then(console.log("deleted", id, "successfully"))
    }

    /**
     * update local state during card drag
     * @param {string} id - the card for which to perform the operation
     * @param {{x: number, y: number}} newPos - the new position
     */
    const changePosition = (id, newPos) => {
        setCards({ ...cards, [id]: { ...cards[id], position: newPos } });
    }

    /**
     * update firebase state after drag end. increase container size if needed.
     * @param {string} id - the card for which to perform the operation
     * @param {{x: number, y: number}} newPos - the new position
     * @todo take card size into account when increasing container size
     */
    const savePosition = (id, newPos) => {
        let updates = {};
        let newContainer = { width: containerRef.current.width, height: containerRef.current.height }

        let projectRef = firebaseDB.ref("documents/" + props.projectID);
        if (newPos.x > containerRef.current.width) {
            console.log("x", newPos.x, "was greater than width", containerRef.current)
            newContainer.width = newPos.x + 300;
        }
        if (newPos.y > containerRef.current.height) {
            console.log("y", newPos.y, "was greater than height", container.current)
            newContainer.height = newPos.y + 300;
        }
        updates["nodes/" + id + "/position/"] = newPos;
        if (newContainer) {
            updates["container/"] = newContainer
        }

        console.log("newcontainer: ", newContainer, "old container: ", containerRef.current)

        projectRef.update(updates)
            .then(console.log("set new position for", id, "to", newPos, "\nresized container to", newContainer));
    }

    /**
     * update card size locally and in firebase
     * @param {string} id - the card for which to perform the operation 
     * @param {{width: number, height: number}} newSize - the new size
     * @todo split into local and remote versions (change/save)
     */
    const resize = (id, newSize) => {
        setCards({ ...cards, [id]: { ...cards[id], size: newSize } });
        projectRef.child(id).child("size").set(newSize).then(console.log("set new size for", id, "to", newSize));
    }

    /**
     * update card content locally
     * @param {string} id - the card for which to perform the operation 
     * @param {object} newContent - the new content to push to local state
     */
    const changeContent = (id, newContent) => {
        console.log("triggered local content change on", id)
        setCards({ ...cards, [id]: { ...cards[id], content: newContent } });
    }

    /** 
     * push card content to firebase (replaces any currently existing content for that card)
     * @param {string} id - the card for which to perform the operation 
     * @param {object} newContent - the new content to push to database
    */
    const saveContent = (id, newContent) => {
        changeContent(id, newContent);
        projectRef.child(id).child("content").set(cards[id]["content"])
            .then(console.log("saved new content for", id));
    }

    /** 
     * change the parent of card id to card newParent
     * @param {string} id - the card for which to perform the operation 
     * @param {string} newParent - the id of the card's new parent
     * @todo implement local state change in addition to firebase change
     * */
    const reparentCard = (id, newParent) => {
        let updates = {};
        let currentParent = cards[id]["parent"];
        updates[id + "/parent"] = newParent;
        updates[currentParent + "/children/" + id] = null;
        updates[newParent + "/children/" + id] = 1;
        projectRef.update(updates)
            .then(console.log("successfully changed the parent of", id, "from", currentParent, "to", newParent))
            .catch(console.log("error reparenting"));
    }

    /**
     * uploads `file` to `path` in the storage bucket
     * @param {blob} file - the file to be uploaded
     * @param {object} metadata - the metadata object associated with the file
     * @param {string} path - a path relative to project_id
     * @param {function(number)} statusCallback - a callback that receives a number [0, 100] indicating upload progress
     */
    const requestUpload = (file, metadata, path, statusCallback) => {
        let custom = {
            ...metadata,
            customMetadata: {
                permissions: {
                    [props.currentUser.uid]: props.permission
                }
            }
        }
        let requestedPathRef = firebaseStorage().ref(props.projectID + path);
        let unsubscribe = requestedPathRef.put(file, custom)
            .on(firebaseStorage.TaskEvent.STATE_CHANGED,
                (snapshot) => {
                    let progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
                    switch (snapshot.state) {
                        case firebaseStorage.TaskState.SUCCESS:
                            statusCallback(100);
                            unsubscribe();
                            break;
                        case firebaseStorage.TaskState.RUNNING:
                            statusCallback(progress);
                            break;
                        default:
                            console.log("error uploading")
                            break;
                    }
                })
    }

    /**
     * get a file and associated metadata (sans permissions) from the storage bucket
     * @param {string} path - the relative path of the requested file (starting from card id)
     * @param {function(string, object)} callback - a function that takes (`downloadURL`, `metadata`) as arguments
     */
    const requestDownload = (path, callback) => {
        let requestedPathRef = firebaseStorage().ref(props.projectID + path)
        requestedPathRef.getDownloadURL()
            .then((url) => {
                requestedPathRef.getMetadata()
                    .then((metadata) =>
                        // remove permissions from metadata sent to callback    
                        callback(url, {
                            ...metadata, customMetadata: {
                                ...metadata["customMetadata"], permissions: undefined
                            }
                        }))
                    .catch((reason) => console.log("failed to fetch metadata for", path, "because", "reason"))
            })
            .catch((reason) => console.log("failed to fetch download URL for", path, "because", reason))
    }

    /**
     * bundling card api methods for ease of transmission 
     */
    let genericAPI = {
        savePosition: savePosition,
        changePosition: changePosition,
        reparentCard: reparentCard,
        removeCard: removeCard,
        addChild: addCard,
        resize: resize
    }

    let typeAPI = {
        saveContent: saveContent,
        changeContent: changeContent,
        requestUpload: requestUpload,
        requestDownload: requestDownload
    }

    return (
        <CardContainer
            container={container}
            cards={cards}
            genericAPI={genericAPI}
            typeAPI={typeAPI}
            permission={props.permission}
        />
    )
}