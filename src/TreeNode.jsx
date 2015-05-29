var React = require('react/addons'),
  TreeNodeMixin = require('./TreeNodeMixin'),
  noop = require('lodash/utility/noop');

/**
 * Individual nodes in tree hierarchy, nested under a single <TreeMenu/> node
 *
 *
 * @type {TreeNode}
 */
var TreeNode = React.createClass({

  mixins : [TreeNodeMixin],

  propTypes : {

    stateful: React.PropTypes.bool,
    checkbox: React.PropTypes.bool,
    collapsible : React.PropTypes.bool,
    collapsed : React.PropTypes.bool,
    expandIconClass: React.PropTypes.string,
    collapseIconClass: React.PropTypes.string,
    checked: React.PropTypes.bool,
    label: React.PropTypes.string.isRequired,
    classNamePrefix: React.PropTypes.string,
    onClick: React.PropTypes.func,
    onCheckChange: React.PropTypes.func,
    onSelectChange: React.PropTypes.func,
    onCollapseChange: React.PropTypes.func,
    labelFilter: React.PropTypes.func

  },

  getInitialState: function () {
    return {};
  },

  getDefaultProps: function () {

    return {
      stateful: false,
      collapsible: true,
      collapsed: false,
      checkbox : false,
      onClick: function(lineage) {
        console.log("Tree Node clicked: " + lineage.join(" > "));
      },
      onCheckChange: function (lineage) {
        console.log("Tree Node indicating a checkbox check state should change: " + lineage.join(" > "));
      },
      onCollapseChange: function (lineage) {
        console.log("Tree Node indicating collapse state should change: " + lineage.join(" > "));
      },
      checked : false,
      expandIconClass: "",
      collapseIconClass: ""
    }

  },

  render : function () {
    var cssPrefix = this._getRootCssClass();

    return (
      <div className={cssPrefix}>
        {this._getCollapseNode()}
        <span onClick={this._handleClick}>
          {this._getCheckboxNode()}
          <label className={this._getLabelClassNames()}>{this._getLabelText()}</label>
        </span>
        <div className={cssPrefix + "-children"}>
          {this._getChildrenNodes()}
        </div>
      </div>
    );
  },

  componentWillReceiveProps: function (nextProps) {

    if (!this._isStateful()) return;

    var mutations = {};

    if (this.props.checked !== nextProps.checked) {
      mutations.checked = nextProps.checked;
    }

    this.setState(mutations);

  },

  hasChildren: function() {
    return this.props.children && this.props.children.length > 0;
  },

  _getCollapseClassName: function() {

    var collapseClassName = this._getRootCssClass() + "-collapse-toggle ";
    var collapseIcon = (this._isCollapsed() ? this.props.expandIconClass : this.props.collapseIconClass);
    collapseClassName += (this.hasChildren() ? collapseIcon : "collapse-spacer");
    return collapseClassName;

  },

  _getCollapseNode: function() {

    if (!this.props.collapsible) return null;
    var handleCollapseChange = this.hasChildren() ? this._handleCollapseChange : noop;
    return <span onClick={ handleCollapseChange } className={ this._getCollapseClassName()} />;

  },

  _getRootCssClass: function () {
    return this.props.classNamePrefix + "-node";
  },

  _getChildrenNodes: function () {

    var props = this.props;

    if (this._isCollapsed()) return null;

    var children = props.children;

    if (this._isStateful()) {
      var state = this.state;
      children = React.Children.map(props.children, function (child) {
        return React.addons.cloneWithProps(child, {
          key: child.key,
          ref: child.ref,
          checked : state.checked
        })
      });
    } 
    return children;

  },

  _getLabelText: function () {

    var displayLabel = this.props.label;
    if (this.props.labelFilter) displayLabel = this.props.labelFilter(displayLabel);
    return displayLabel;

  },

  _getLabelClassNames: function () {

    var labelClassName = this.props.classNamePrefix + "-node-label";
    if (this._isSelected()) labelClassName += " selected";
    return labelClassName;

  },

  _getCheckboxNode: function () {

    var props = this.props;
    if (!props.checkbox) return null;

    return <input
      className={props.classNamePrefix + "-node-checkbox"}
      type="checkbox"
      checked={this._isChecked()}
      onChange={noop}/>;

  },

  _isStateful: function () {

    return this.props.stateful ? true : false;

  },

  _isChecked: function () {

    if (this._isStateful() && typeof this.state.checked !== "undefined") return this.state.checked;
    return this.props.checked;

  },

  _isSelected: function () {

    if (this._isStateful() && typeof this.state.selected !== "undefined") return this.state.selected;
    return this.props.selected;

  },

  _isCollapsed: function () {

    if (!this.props.collapsible) return false;
    if (this._isStateful() && this.state.collapsed) return true;
    return this.props.collapsed;

  },

  _handleClick: function () {

    if (this.props.checkbox) {
      return this._handleCheckChange();
    } else if (this.props.onSelectChange) {
      return this._handleSelectChange();
    }

    this.props.onClick(this._getLineage());

  },

  _toggleNodeStateIfStateful: function (field) {

    if (this._isStateful()) {
      var newValue = !this.props[field];
      if (typeof this.state[field] !== "undefined") {
        newValue = !this.state[field];
      }
      var mutation = {};
      mutation[field] = newValue;
      console.log(mutation);
      this.setState(mutation);
    }

  },

  _handleCheckChange: function () {

    this._toggleNodeStateIfStateful("checked");

    this.props.onCheckChange(this._getLineage());

  },

  _handleSelectChange: function () {

    this._toggleNodeStateIfStateful("selected");

    this.props.onSelectChange(this._getLineage());

  },

  _handleCollapseChange: function () {

    this._toggleNodeStateIfStateful("collapsed");

    this.props.onCollapseChange(this._getLineage());

  },

  _getLineage: function () {

    return this.props.ancestor.concat(this.props.id);

  }

});


module.exports = TreeNode;