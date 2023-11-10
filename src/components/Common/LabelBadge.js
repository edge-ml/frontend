import { Badge } from 'reactstrap';
import {
  hexToForegroundColor,
  isValidColor,
} from '../../services/ColorService';

const LabelBadge = ({ color, children, ...props }) => {
  // if (!isValidColor(color)) {
  //     throw new Error('Invalid color provided');
  // }
  return (
    <Badge
      style={{ backgroundColor: color, color: hexToForegroundColor(color) }}
      {...props}
    >
      {children}
    </Badge>
  );
};

export default LabelBadge;
