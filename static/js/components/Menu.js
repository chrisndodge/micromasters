// adapted from https://github.com/callemall/material-ui/blob/8e80a35e8d2cdb410c3727333e8518cadc08783b/src/Menu/Menu.js
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import update from 'react-addons-update';
import shallowEqual from 'recompose/shallowEqual';
import ClickAwayListener from 'material-ui/internal/ClickAwayListener';
import autoPrefix from 'material-ui/utils/autoPrefix';
import transitions from 'material-ui/styles/transitions';
import keycode from 'keycode';
import propTypes from 'material-ui/utils/propTypes';
import List from './List';
import deprecated from 'material-ui/utils/deprecatedPropType';
import warning from 'warning';

function getStyles(props, context) {
  const {
    animated,
    desktop,
    maxHeight,
    openDirection = 'bottom-left',
    width,
  } = props;

  const openDown = openDirection.split('-')[0] === 'bottom';
  const openLeft = openDirection.split('-')[1] === 'left';

  const {muiTheme} = context;

  const styles = {
    root: {
      // Nested div bacause the List scales x faster than it scales y
      transition: animated ? transitions.easeOut('250ms', 'transform') : null,
      zIndex: muiTheme.zIndex.menu,
      top: openDown ? 0 : null,
      bottom: !openDown ? 0 : null,
      left: !openLeft ? 0 : null,
      right: openLeft ? 0 : null,
      transform: animated ? 'scaleX(0)' : null,
      transformOrigin: openLeft ? 'right' : 'left',
      opacity: 0,
      maxHeight: maxHeight,
      overflowY: maxHeight ? 'auto' : null,
    },
    divider: {
      marginTop: 7,
      marginBottom: 8,
    },
    list: {
      display: 'table-cell',
      paddingBottom: desktop ? 16 : 8,
      paddingTop: desktop ? 16 : 8,
      userSelect: 'none',
      width: width,
    },
    menuItemContainer: {
      transition: animated ? transitions.easeOut(null, 'opacity') : null,
      opacity: 0,
    },
    selectedMenuItem: {
      color: muiTheme.baseTheme.palette.accent1Color,
    },
  };

  return styles;
}

class Menu extends Component {
  static propTypes = {
    /**
     * If true, the menu will apply transitions when it
     * is added to the DOM. In order for transitions to
     * work, wrap the menu inside a `ReactTransitionGroup`.
     */
    animated: deprecated(PropTypes.bool, 'Instead, use a [Popover](/#/components/popover).'),
    /**
     * If true, the width of the menu will be set automatically
     * according to the widths of its children,
     * using proper keyline increments (64px for desktop,
     * 56px otherwise).
     */
    autoWidth: PropTypes.bool,
    /**
     * The content of the menu. This is usually used to pass `MenuItem`
     * elements.
     */
    requestsList: PropTypes.array,
    /**
     * If true, the menu item will render with compact desktop styles.
     */
    desktop: PropTypes.bool,
    /**
     * If true, the menu will not be auto-focused.
     */
    disableAutoFocus: PropTypes.bool,
    /**
     * If true, the menu will be keyboard-focused initially.
     */
    initiallyKeyboardFocused: PropTypes.bool,
    /**
     * Override the inline-styles of the underlying `List` element.
     */
    listStyle: PropTypes.object,
    /**
     * The maximum height of the menu in pixels. If specified,
     * the menu will be scrollable if it is taller than the provided
     * height.
     */
    maxHeight: PropTypes.number,
    menuHeight: PropTypes.number.isRequired,
    /**
     * If true, `value` must be an array and the menu will support
     * multiple selections.
     */
    multiple: PropTypes.bool,
    /**
     * Callback function fired when a menu item with `value` not
     * equal to the current `value` of the menu is touch-tapped.
     *
     * @param {object} event TouchTap event targeting the menu item.
     * @param {any}  value If `multiple` is true, the menu's `value`
     * array with either the menu item's `value` added (if
     * it wasn't already selected) or omitted (if it was already selected).
     * Otherwise, the `value` of the menu item.
     */
    onChange: PropTypes.func,
    /**
     * Callback function fired when the menu is focused and the *Esc* key
     * is pressed.
     *
     * @param {object} event `keydown` event targeting the menu.
     */
    onEscKeyDown: PropTypes.func,
    /**
     * Callback function fired when a menu item is touch-tapped.
     *
     * @param {object} event TouchTap event targeting the menu item.
     * @param {object} menuItem The menu item.
     * @param {number} index The index of the menu item.
     */
    onItemTouchTap: PropTypes.func,
    /**
     * Callback function fired when the menu is focused and a key
     * is pressed.
     *
     * @param {object} event `keydown` event targeting the menu.
     */
    onKeyDown: PropTypes.func,
    /**
     * This is the placement of the menu relative to the `IconButton`.
     */
    openDirection: deprecated(propTypes.corners, 'Instead, use a [Popover](/#/components/popover).'),
    renderItem: PropTypes.func.isRequired,
    /**
     * Override the inline-styles of selected menu items.
     */
    selectedMenuItemStyle: PropTypes.object,
    /**
     * Override the inline-styles of the root element.
     */
    style: PropTypes.object,
    /**
     * If `multiple` is true, an array of the `value`s of the selected
     * menu items. Otherwise, the `value` of the selected menu item.
     * If provided, the menu will be a controlled component.
     * This component also supports valueLink.
     */
    value: PropTypes.any,
    /**
     * ValueLink for the menu's `value`.
     */
    valueLink: PropTypes.object,
    /**
     * The width of the menu. If not specified, the menu's width
     * will be set according to the widths of its children, using
     * proper keyline increments (64px for desktop, 56px otherwise).
     */
    width: propTypes.stringOrNumber,
    /**
     * @ignore
     * Menu no longer supports `zDepth`. Instead, wrap it in `Paper`
     * or another component that provides zDepth.
     */
    zDepth: propTypes.zDepth,
  };

  static defaultProps = {
    autoWidth: true,
    desktop: false,
    disableAutoFocus: false,
    initiallyKeyboardFocused: false,
    maxHeight: null,
    multiple: false,
    onChange: () => {},
    onEscKeyDown: () => {},
    onItemTouchTap: () => {},
    onKeyDown: () => {},
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    const filteredChildren = this.getFilteredChildren(props.requestsList);
    const selectedIndex = this.getSelectedIndex(props, filteredChildren);

    this.state = {
      focusIndex: props.disableAutoFocus ? -1 : selectedIndex >= 0 ? selectedIndex : 0,
      isKeyboardFocused: props.initiallyKeyboardFocused,
      keyWidth: props.desktop ? 64 : 56,
      width: 0
    };
  }

  componentDidMount() {
    if (this.props.autoWidth) this.setWidth();
    if (!this.props.animated) this.animateOpen();
    this.setScollPosition();
  }

  componentWillReceiveProps(nextProps) {
    const filteredChildren = this.getFilteredChildren(nextProps.requestsList);
    const selectedIndex = this.getSelectedIndex(nextProps, filteredChildren);

    this.setState({
      focusIndex: nextProps.disableAutoFocus ? -1 : selectedIndex >= 0 ? selectedIndex : 0,
      keyWidth: nextProps.desktop ? 64 : 56,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );
  }

  componentDidUpdate() {
    if (this.props.autoWidth) this.setWidth();
  }

  handleClickAway = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    this.setFocusIndex(-1, false);
  };

  // Do not use outside of this component, it will be removed once valueLink is deprecated
  getValueLink(props) {
    return props.valueLink || {
      value: props.value,
      requestChange: props.onChange,
    };
  }

  setKeyboardFocused(keyboardFocused) {
    this.setState({
      isKeyboardFocused: keyboardFocused,
    });
  }

  getFilteredChildren(children) {
    return children;
  }

  animateOpen() {
    const rootStyle = ReactDOM.findDOMNode(this).style;
    const scrollContainerStyle = ReactDOM.findDOMNode(this.refs.scrollContainer).style;
    const menuContainers = ReactDOM.findDOMNode(this.refs.list).childNodes;

    autoPrefix.set(rootStyle, 'transform', 'scaleX(1)');
    autoPrefix.set(scrollContainerStyle, 'transform', 'scaleY(1)');
    scrollContainerStyle.opacity = 1;

    for (let i = 0; i < menuContainers.length; ++i) {
      menuContainers[i].style.opacity = 1;
    }
  }

  cloneMenuItem(child, childIndex, styles, index) {
    const {
      desktop,
      selectedMenuItemStyle,
    } = this.props;

    const selected = this.isChildSelected(child, this.props);
    let selectedChildrenStyles = {};

    if (selected) {
      selectedChildrenStyles = Object.assign(styles.selectedMenuItem, selectedMenuItemStyle);
    }

    const mergedChildrenStyles = Object.assign({}, child.props.style, selectedChildrenStyles);

    const isFocused = childIndex === this.state.focusIndex;
    let focusState = 'none';
    if (isFocused) {
      focusState = this.state.isKeyboardFocused ?
        'keyboard-focused' : 'focused';
    }

    return React.cloneElement(child, {
      desktop: desktop,
      focusState: focusState,
      onTouchTap: (event) => {
        this.handleMenuItemTouchTap(event, child, index);
        if (child.props.onTouchTap) child.props.onTouchTap(event);
      },
      ref: isFocused ? 'focusedMenuItem' : null,
      style: mergedChildrenStyles,
    });
  }

  decrementKeyboardFocusIndex() {
    let index = this.state.focusIndex;

    index--;
    if (index < 0) index = 0;

    this.setFocusIndex(index, true);
  }

  getMenuItemCount(filteredChildren) {
    return filteredChildren.length;
  }

  getSelectedIndex(props, filteredChildren) {
    let selectedIndex = -1;
    let menuItemIndex = 0;

    filteredChildren.forEach((child) => {
      const childIsADivider = false; //child.type && child.type.muiName === 'Divider';

      if (this.isChildSelected(child, props)) selectedIndex = menuItemIndex;
      if (!childIsADivider) menuItemIndex++;
    });

    return selectedIndex;
  }

  handleKeyDown = (event) => {
    const filteredChildren = this.getFilteredChildren(this.props.requestsList);
    switch (keycode(event)) {
    case 'down':
      event.preventDefault();
      this.incrementKeyboardFocusIndex(filteredChildren);
      break;
    case 'esc':
      this.props.onEscKeyDown(event);
      break;
    case 'tab':
      event.preventDefault();
      if (event.shiftKey) {
        this.decrementKeyboardFocusIndex();
      } else {
        this.incrementKeyboardFocusIndex(filteredChildren);
      }
      break;
    case 'up':
      event.preventDefault();
      this.decrementKeyboardFocusIndex();
      break;
    }
    this.props.onKeyDown(event);
  };

  handleMenuItemTouchTap(event, item, index) {
    const children = this.props.requestsList;
    const multiple = this.props.multiple;
    const valueLink = this.getValueLink(this.props);
    const menuValue = valueLink.value;
    const itemValue = item.props.value;
    const focusIndex = React.isValidElement(children) ? 0 : children.indexOf(item);

    this.setFocusIndex(focusIndex, false);

    if (multiple) {
      const itemIndex = menuValue.indexOf(itemValue);
      const newMenuValue = itemIndex === -1 ?
        update(menuValue, {$push: [itemValue]}) :
        update(menuValue, {$splice: [[itemIndex, 1]]});

      valueLink.requestChange(event, newMenuValue);
    } else if (!multiple && itemValue !== menuValue) {
      valueLink.requestChange(event, itemValue);
    }

    this.props.onItemTouchTap(event, item, index);
  }

  incrementKeyboardFocusIndex(filteredChildren) {
    let index = this.state.focusIndex;
    const maxIndex = this.getMenuItemCount(filteredChildren) - 1;

    index++;
    if (index > maxIndex) index = maxIndex;

    this.setFocusIndex(index, true);
  }

  isChildSelected(child, props) {
    const menuValue = this.getValueLink(props).value;
    const childValue = child.value;

    return menuValue === childValue;
  }

  setFocusIndex(newIndex, isKeyboardFocused) {
    this.setState({
      focusIndex: newIndex,
      isKeyboardFocused: isKeyboardFocused,
    });
  }

  setScollPosition() {
    const desktop = this.props.desktop;
    const focusedMenuItem = this.refs.focusedMenuItem;
    const menuItemHeight = desktop ? 32 : 48;

    if (focusedMenuItem) {
      const selectedOffSet = ReactDOM.findDOMNode(focusedMenuItem).offsetTop;

      // Make the focused item be the 2nd item in the list the user sees
      let scrollTop = selectedOffSet - menuItemHeight;
      if (scrollTop < menuItemHeight) scrollTop = 0;

      ReactDOM.findDOMNode(this.refs.scrollContainer).scrollTop = scrollTop;
    }
  }

  setWidth() {
    const el = ReactDOM.findDOMNode(this);
    const listEl = ReactDOM.findDOMNode(this.refs.list);
    const elWidth = el.offsetWidth || 0;

    el.style.width = `${elWidth}px`;
    listEl.style.width = `${elWidth}px`;
    this.setState({width: elWidth});
  }

  render() {
    const {
      animated,
      autoWidth, // eslint-disable-line no-unused-vars
      requestsList,
      desktop, // eslint-disable-line no-unused-vars
      initiallyKeyboardFocused, // eslint-disable-line no-unused-vars
      listStyle,
      maxHeight, // eslint-disable-line no-unused-vars
      multiple, // eslint-disable-line no-unused-vars
      openDirection = 'bottom-left', // eslint-disable-line no-unused-vars
      selectedMenuItemStyle, // eslint-disable-line no-unused-vars
      style,
      value, // eslint-disable-line no-unused-vars
      valueLink, // eslint-disable-line no-unused-vars
      width, // eslint-disable-line no-unused-vars
      zDepth,
      menuHeight,
      renderItem,
      ...other,
    } = this.props;

    warning((typeof zDepth === 'undefined'), 'Menu no longer supports `zDepth`. Instead, wrap it in `Paper` ' +
      'or another component that provides `zDepth`.');

    const {prepareStyles} = this.context.muiTheme;
    const styles = getStyles(this.props, this.context);

    const mergedRootStyles = Object.assign(styles.root, style);
    const mergedListStyles = Object.assign(styles.list, listStyle);

    const filteredChildren = this.getFilteredChildren(requestsList);

    const childFilter = (child, index) => {
      let childrenContainerStyles = {};

      if (animated) {
        let transitionDelay = 0;

        childrenContainerStyles = Object.assign({}, styles.menuItemContainer, {
          transitionDelay: `${transitionDelay}ms`,
        });
      }

      const clonedChild = this.cloneMenuItem(child, index, styles, index);

      return animated ? (
        <div style={prepareStyles(childrenContainerStyles)}>{clonedChild}</div>
      ) : clonedChild;
    };

    return (
      <ClickAwayListener onClickAway={this.handleClickAway}>
        <div
          onKeyDown={this.handleKeyDown}
          style={prepareStyles(mergedRootStyles)}
          ref="scrollContainer"
        >
          <List
            {...other}
            ref="list"
            style={mergedListStyles}
            width={this.state.width}
            menuHeight={menuHeight}
            items={filteredChildren}
            renderItem={renderItem}
            childFilter={childFilter}
          />
        </div>
      </ClickAwayListener>
    );
  }
}

export default Menu;
