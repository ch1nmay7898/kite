import React, { useState } from 'react';
import InlineTextEdit from '../InlineTextEdit/InlineTextEdit';

import "../../styles/SearchBar.scss";
import { observer } from 'mobx-react-lite';
import { useStore } from '../../store/hook'
import SearchElements from '../../constants/searchTemplate';
import SearchedItem from './SearchDropdown';
/**
 * 
 * @param {*} props - index and callback
 */
const SearchBar = (props) => {
    const store = useStore();
    const [results, setResults] = useState({ matches: [], suggest: [] });
    const [actionResult, setActionResult] = useState({ matches: [], suggest: [] });
    const [dropdown, setDropdown] = useState(false);
    const searchValues = (text) => {
        if (props.document) {
            const indexes = [
                'name', 'extension', 'title', 'text', 'url', "description",
                'fileName', 'labels', 'captions', 'author_url', 'author_name'
            ];
            //store.getActionQuery(data => {console.log("ACTION ",data,MiniSearch.loadJSON(serverData,{fields:['searchQuery']}))});

            const searchObject = new SearchElements(indexes);

            const [result, suggestions] = searchObject.getResult(text, store.cards);
            const [actionResult, actionSuggestion] = searchObject.getActionSearchResult(text);
            setActionResult({ matches: actionResult, suggest: actionSuggestion });
            setResults({ matches: result, suggest: suggestions });
            setDropdown(result.length > 0 || actionResult.length > 0);
        }
        else {
            const indexes = ['name'];

            const searchObject = new SearchElements(indexes);
            const [result, suggestions] = searchObject.getResult(text, store.projects);

            setResults({ matches: result, suggest: suggestions });
            store.highlightSearched(result, 'projects');
        }

    }
    return (
        <div className="menu-bar-searchbox ">
            <img className="searchbar-search-icon" alt="magnifying glass" src={require("../../assets/search-icon.svg")} />
            <InlineTextEdit
                borderColor='black'
                placeholder="Search for an item or action"
                onChange={(e) => searchValues(e.target.value)}
            />
            {
                (results.matches.length || actionResult.matches.length) &&
                <SearchedItem
                    results={results} actionResult={actionResult} document={props.document} dashboard={props.dashboard}
                    className="dropdown-content" dropdown={dropdown}
                    setDropdown={setDropdown}
                />
            }


        </div>
    )
}
export default React.memo(observer(SearchBar));