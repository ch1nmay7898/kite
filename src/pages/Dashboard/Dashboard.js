import React, { useState, useEffect, useRef, useReducer } from 'react'
import DashboardCard from "./DashboardCard"
import { observer } from 'mobx-react-lite'
import ChooseTemplate from '../../components/ChooseTemplate/ChooseTemplate'
import { useStore } from '../../store/hook'
import { useHistory, useLocation } from 'react-router-dom'
import SearchBar from '../../components/Search/SearchBar'
import UserMenu from "../../components/UserMenu/UserMenu"

import { ReactComponent as LogoSVG } from '../../assets/dashboard/logo.svg';
import { ReactComponent as GraphicRightSVG } from '../../assets/login/graphic-right.svg';
import { ReactComponent as GraphicLeftSVG } from '../../assets/login/graphic-left.svg';
import "../../styles/Dashboard.scss";


const Dashboard = observer(() => {
  const store = useStore();
  const history = useHistory();
  const buttonRef = useRef(null);
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [filterProject, setFilterProject] = useState('All Projects');
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (store.filteredProjectID.length)
      setFilterProject('Searching Project')
    else setFilterProject('All Projects')
  }, [store.filteredProjectID.length])

  useEffect(() => {
    store.addDashboardListeners(forceUpdate)
    return () => store.removeDashboardListeners()
  }, [store])

  const signOut = () => {    
    store.signout();
    history.push('/login', { from: location });
  }
  useEffect(() => {
    function handleClickOutside(event) {
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [buttonRef]);

  let [isTemplateExpanded, setTemplateExpanded] = useState(false);

  const onOpen = (id) => {
    store.setProjectID(id);
    history.push("/project/" + id, { from: location })
  }

  const sortProject = () => {
    switch (filterProject) {
      case 'All Projects':
        return store.allProjects;
      case 'Starred Project':
        return store.starredProjects;
      case 'Shared Project':
        return store.sharedProject;
      case 'Searching Project':
        return store.searchedProject;
      default: break;
    }
  }

  return (
    <div className="dashboard-page">
      <GraphicRightSVG className="graphic-right" alt="decoration" />
      <GraphicLeftSVG className="graphic-left" alt="decoration" />      
      <div className="top-bar">
        <div className="site-title">
          <LogoSVG/>
        </div>
        <div className="user-welcome">
          <div className="welcome-text">
            <span className="welcome-bold">Welcome,</span>
            <span className="user-name">{store.currentUser.displayName}</span>
          </div>
          <div ref={buttonRef} className="profile-picture">
            <img src={store.currentUser.photoURL} onClick={() => setShowMenu(!showMenu)} alt={"dash-pfp"}/>
            {showMenu ?
              <span className="user-menu">
                <UserMenu signOut={signOut} />
              </span> : null}
          </div>
        </div>
      </div>
      <div className={"main-section" + (isTemplateExpanded ? " inherit-position" : "")}>
        <div className="project-section">
          <div className="project-section-header">
            <div className="header-left-container">
              <div className="dashboard-title">
                <select className="select" onChange={e => setFilterProject(e.target.value)}>
                  <option value={'All Projects'}>
                    All Projects
                  </option>
                  <option value="Starred Project">
                    Starred
                  </option>
                  {/* <option value="Shared Project">
                    Shared Project
                  </option> */}
                </select>
              </div>
            </div>
            <div className="header-right-container">
              <ChooseTemplate
                openProject={onOpen}
                isExpanded={isTemplateExpanded}
                setIsExpanded={(bool) => setTemplateExpanded(bool)}
              />
              <SearchBar dashboard />
            </div>
          </div>

          <div className="project-section-content">
            <div className="row-headings">
              <span className="heading title">Title</span>
              <div className="rest">
                <span className="heading date">Last edited</span>
                <span className="heading date">Created</span>
                <span className="heading shared">Shared with</span>
              </div>
            </div>
            {
              sortProject().map((id) => <DashboardCard key={id} id={id} onOpen={() => onOpen(id)} />)
            }
          </div>
        </div>
        <div className="recent-activity-section">
        </div>
      </div>
    </div >
  )
})
export default Dashboard;