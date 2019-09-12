import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Logo from './Logo';

const BubbleWrapper = styled('div')`
  position: fixed;
  bottom: 10px;
  right: 0px;
  padding-right: 26px;
  transition: transform 0.1s ease-in-out;
  ${props =>
    props.hide &&
    `
    transform: translateX(76%);
  `}
`;

const Bubble = styled('div')`
  background-color: rgb(48, 85, 234);
  height: 60px;
  cursor: pointer;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  width: 60px;
  position: relative;
  box-shadow: rgba(14, 39, 140, 0.3) 0px 4px 10px 0px;
  user-select: none;
  opacity: 0.8;
  border-radius: 30px;
  padding: 8px;
  transition: background-color 0.2s ease 0s, opacity 0.2s ease 0s;
  &:hover {
    background-color: rgb(21, 59, 210);
    opacity: 1;
  }
`;

const App = () => {
  const ref = React.useRef();
  const [hide, setHide] = React.useState<boolean>(false);

  const toggleBubble = () => {
    setHide(s => !s);
  };

  React.useEffect(() => {}, []);

  return (
    <BubbleWrapper hide={hide} ref={ref} onClick={toggleBubble}>
      <Bubble>
        <Logo />
      </Bubble>
    </BubbleWrapper>
  );
};

const doc = window.document;
const node = doc.createElement('div');
doc.body.appendChild(node);

ReactDOM.render(<App />, node);
