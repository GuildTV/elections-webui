import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { DragSource, DropTarget } from 'react-dnd';

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const cardTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    props.moveCard(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  },
};

// HACK: Fix this:
// @DropTarget("TickerItem", cardTarget, connect => ({
//   connectDropTarget: connect.dropTarget(),
// }))
// @DragSource("TickerItem", cardSource, (connect, monitor) => ({
//   connectDragSource: connect.dragSource(),
//   isDragging: monitor.isDragging(),
// }))
export class TickerItem extends React.Component {
  static propTypes = {
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    isDragging: PropTypes.bool.isRequired,
    data: PropTypes.object.isRequired,
    moveCard: PropTypes.func.isRequired,
  };

  showEdit(e){
    e.preventDefault();

    return this.props.showEdit();
  }

  setEnabled(e){
    e.preventDefault();

    this.props.setEnabled(!this.props.data.enabled);
  }

  render(){
    const { connectDragSource, connectDropTarget } = this.props;

    const { text, enabled } = this.props.data;

    return connectDragSource(connectDropTarget(
      <tr className={enabled ? "" : "disabled"}>
        <td><p>{ text }</p></td>
        <td className="borderLeft"><a href="#" onClick={e => this.setEnabled(e)}>{ enabled ? "Disable" : "Enable" }</a></td>
        <td><a href="#" onClick={e => this.showEdit(e)}>Edit</a></td>
      </tr>
    ));
  }
}
