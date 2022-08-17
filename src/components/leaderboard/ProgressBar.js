import styled from "styled-components";

const Progress = styled.div`
  height: 100%;
  width: ${(props) => props.percent}%;
  background: #f59e0c;
`;

const ProgressBar = ({ percent }) => {
  return (
    <div className="h-2 w-full bg-fourth">
      <Progress percent={percent} />
    </div>
  );
};

export default ProgressBar;
