import React, { Component } from 'react';
import Search from 'grommet/components/Search';

export default class Home extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
  }

  componentDidMount() {
    //this.props.dispatch(loadTemplates());
  }

  _onSearch(value) {
    console.log(value);
  }

  render() {
    return (
      <div>
        <div className="searchviews">
          <Search inline={true} placeholder="Search views" size="medium"
            fill={true} responsive={false} onDOMChange={this._onSearch}/>
        </div>
      </div>
    );
  }
}
