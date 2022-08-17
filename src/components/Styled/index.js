import styled from "styled-components";

export const ScrollWrap = styled.div`
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const CollectionWrap = styled.div`
  @media (max-width: 768px) {
    min-width: 1000px;
  }
  @media (max-width: 600px) {
    min-width: 800px;
  }
`;
