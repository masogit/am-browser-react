import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import RecordList from './RecordList';
import Box from 'grommet/components/Box';
import AMSideBar from '../commons/AMSideBar';
import ContentPlaceHolder from '../commons/ContentPlaceHolder';
import BarCodeEditor from './BarCodeEditor';

export default class Explorer extends Component {

  constructor() {
    super();
    this.state = {
      view: null,
      navigation: null,
      pdfGenerator: null
    };
  }

  componentWillMount() {
    const id = this.props.params.id;
    if (id) {
      ExplorerActions.loadView(id).then((view) => {
        this.setState({view: view});
      });
    } else {
      ExplorerActions.loadViews().then(views => {
        if (views) {
          const content = views.map((view, key) => ({
            key: view._id,
            groupby: view.category,
            onClick: this.queryView.bind(this, view),
            search: view.name,
            child: view.name
          }));
          this.setState({navigation: content});
        }
      });
    }
  }

  queryView(view) {
    this.setState({
      view: null
    }, ()=> {
      this.setState({
        view: view
      });
    });
  }

  printPdf(pdfGenerator) {
    this.setState({pdfGenerator});
  }

  render() {
    const {navigation, view, pdfGenerator} = this.state;
    const content = [];
    if (pdfGenerator) {
      content.push(<BarCodeEditor {...pdfGenerator} key='BarCodeEditor' back={() => this.setState({pdfGenerator: null})}/>);
    } else {
      const focus = {};
      if (view) {
        focus.expand = view.category;
        focus.selected = view._id;
        content.push(
          <Box margin={{horizontal: 'small'}} flex={true} key='RecordList'>
            <RecordList body={view.body} title={view.name} root={true} printPdf={this.printPdf.bind(this)}/>
          </Box>);
      } else {
        focus.expand = false;
        focus.selected = '';
        content.push(<ContentPlaceHolder key='ContentPlaceHolder' content='Select an item to query.' />);
      }

      if (navigation) {
        content.unshift(<AMSideBar key='AMSideBar' focus={focus} title='Views Navigation' contents={navigation}/>);
      }
    }

    return (
      <Box direction="row" flex={true}>
        {content}
      </Box>
    );
  }
}

