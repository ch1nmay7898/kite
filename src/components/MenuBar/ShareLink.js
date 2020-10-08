import React, { useState } from "react"
import Button from "../Button/Button"
import { Modal } from "react-bootstrap"
import { firebaseDB, firebaseFunction, firebaseTIME } from "../../services/firebase"
import LinkSharing from "./LinkSharing"
import * as Crypto from 'crypto-js/aes';
import "../../styles/MenuBar.scss"

//----Create "Public" in Database ----
const createPublic = (id, permission, uid, name,email,photoURL) => {
    const path = `documents/${id}/`;
    const updates = {};
    updates[path + "/users/public"] = permission;
    updates[path + "/room/" + uid] = {
        name: name,
        photoURL : photoURL,
        email: email,
        permission:permission
    }
    updates[`documents/${id}/cursors/${uid}`] = {
        x : 0,
        y : 0,
        time: firebaseTIME
    }
    firebaseDB.ref().update(updates).then(console.log("Created Public With Permission", permission))
}
//----Creates Room When Public Type is called---
const createRoom = async (child, uid, name,permission,email,photoURL) => {
    const updates = {};
    updates[`documents/${child}/cursors/${uid}`] = {
        x : 0,
        y : 0,
        time: firebaseTIME
    }
    updates[`documents/${child}/room/` + uid] = {
        name : name,
        photoURL : photoURL,
        email: email,
        permission:permission
    }
    await firebaseDB.ref().update(updates).then(console.log("Created ROOM")).catch(err => err)

}
const ShareLink = (props) => {
    //Show Modal State
    const [show, setShow] = useState(false);
    //Show Generated Link State
    const [link, setLink] = useState(false)
    //Show Email State
    const [email , setEmail] = useState([]);
    const [emailShow , setEmailShow] = useState(false);
    //Type Link , Permission & URL State
    const [linkType, setLinkType] = useState();
    const [permission, setPermission] = useState();
    const [url, setURL] = useState();

    const handleShow = () => setShow(true);
    const title = "Groupthink Website"
    function replaceAll(str, term, replacement) {
        return str.replace(new RegExp(escapeRegExp(term), 'g'), replacement);
    }
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    const isValidEmail = (text) =>
    {
        const regExForEMail = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
        return regExForEMail.test(text)
    }
    const isWhitespaceNotEmpty = (text) =>{
        return text.length > 0 && !/[^\s]/.test(text);
    }
    const openLink = (operation) =>()=> {
        if(operation === 'emailLink' && (linkType != undefined && permission != undefined))
        {
            setEmailShow(true);
            console.log("This Operation \n",linkType , permission , url , emailShow)
            // createRoom(props.projectID, props.currentUser.uid, 
            //     props.currentUser.displayName,permission , props.currentUser.email , 
            //     props.currentUser.photoURL
            // )
            // .then("Room & Cursor Made").catch(err => err)
            const encryptPermission = replaceAll(Crypto.encrypt(permission, "grpthink12!").toString(), '/', '$');
            const encryptName = replaceAll(Crypto.encrypt(props.currentUser.displayName, "grpthink12!").toString(), '/', '$');
            const encryptType = replaceAll(Crypto.encrypt(linkType, "grpthink12!").toString(), '/', '$');
            // ------- Used '/' to omit "/:permissionID"
            console.log(encryptPermission, permission, "\n Name ", encryptName, "\n Type \n", encryptType)
            setURL(String(window.location) + "/" + encryptPermission + "/" + encryptType + "/" + encryptName)
            
        }
        else if (linkType != undefined && permission != undefined) {
            setLink(true)
            if (linkType === "private") {
                createRoom(props.projectID, props.currentUser.uid, 
                    props.currentUser.displayName,permission , props.currentUser.email , 
                    props.currentUser.photoURL
                )
                .then("Room & Cursor Made").catch(err => err)
            }
            else {
                createPublic(props.projectID, permission, props.currentUser.uid,
                    props.currentUser.displayName, props.currentUser.email , 
                    props.currentUser.photoURL
                )
            }
            const encryptPermission = replaceAll(Crypto.encrypt(permission, "grpthink12!").toString(), '/', '$');
            const encryptName = replaceAll(Crypto.encrypt(props.currentUser.displayName, "grpthink12!").toString(), '/', '$');
            const encryptType = replaceAll(Crypto.encrypt(linkType, "grpthink12!").toString(), '/', '$');
            // ------- Used '/' to omit "/:permissionID"
            console.log(encryptPermission, permission, "\n Name ", encryptName, "\n Type \n", encryptType)
            setURL(String(window.location) + "/" + encryptPermission + "/" + encryptType + "/" + encryptName)
        }
        else
        {
            setEmailShow(false);
            setLink(false)
        }
    }
    const ChangeRadio = (e) => {
        setPermission(e.target.value)
    }
    const LinkType = (e) => {
        setLinkType(e.target.value)
    }
    //----------While Closing Set Everything As At Initial Level----------
    const handleClose = () => {
        setShow(false);
        setLink(false);
        setURL(null);
        setLinkType(null);
        setPermission(null);
        setEmail([]);
    }
    const onChangeEmails = (e) => 
    {
        console.log("Input is ",e.target.value);
        
        const text = e.target.value;
        const textParts = text.split(" ")
        console.log("textParts",textParts);
        if(textParts.length >1)
        Object.keys(textParts).map(item => {
            if(isValidEmail(item))
            {
                setEmail(...email,item)
            }
        })
        else if(isValidEmail(textParts[0]))
        setEmail([textParts[0]])
    }
    const sendEmails = () => 
    {
        console.log("Send Emails",email.length , url)
        if(email.length > 0)
        {
            const updates = {};
            Object.keys(email).map(item=>{
                updates["email"] = email;
                updates["link"] = url;
            })
            var addMsg = firebaseFunction.httpsCallable('sendLinkEmail')
            addMsg(updates).then((result) =>console.log("Sended Email", result)).catch(err => console.log(err))
            
        }
    }
    console.log("EMALS",email)
    return (
        <>
            <Button className={props.buttonClassName} handleClick={handleShow}>
                Share
            </Button>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Share Your Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Type Of Link To be Shared
                    <br />
                    <input type="radio" name="linkType" value="public" onChange={e => LinkType(e)} required={true} />
                    <label htmlFor="male">Public</label>
                    <input type="radio" name="linkType" value="private" onChange={e => LinkType(e)} required={true} />
                    <label htmlFor="male">Private </label>
                    <br />
                    <input type="radio" name="options" value="r" onChange={e => ChangeRadio(e)} required={true} />
                    <label htmlFor="male">Read Only</label>
                    <input type="radio" name="options" value="rw" onChange={e => ChangeRadio(e)} required={true} />
                    <label htmlFor="male">Read and Write </label>
                    <br />
                    
                    {
                        emailShow ?
                        <div>
                            <input placeholder="Enter Email ID's" type="text" name="emails" onChange={e=>onChangeEmails(e)} required={true}/>
                            <input type="submit" onClick={sendEmails}/>
                        </div>
                        :<Button className="custom_btn" handleClick={openLink("emailLink")}>Send Email </Button>
                    }
                    {
                        link ?
                            <div>
                                <br />
                            Copy Your Link :
                            <br />
                                <b style={{ display: "inline-flex" }}>{url}</b>
                                <br />
                                <LinkSharing url={url} title={title} size="2.5rem" />
                            </div>
                            : <Button className="custom_btn" handleClick={openLink()}>Generate Link</Button>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button className="custom_btn" handleClick={handleClose}>Close</Button>
                    <Button className="custom_btn" handleClick={handleClose}>Save Changes</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
export default ShareLink;