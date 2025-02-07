import React from 'react';

type ToolbarProps = {
  currentStyle: string;
  onChangeStyle: (style: string) => void;
};

const styles = ['solid', 'dashed', 'calligraphy', 'neon'];

const Toolbar: React.FC<ToolbarProps> = ({ currentStyle, onChangeStyle }) => (
  <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
    {styles.map((style) => (
      <button
        key={style}
        onClick={() => onChangeStyle(style)}
        style={{
          marginRight: 5,
          backgroundColor: currentStyle === style ? 'lightblue' : 'white'
        }}
      >
        {style.charAt(0).toUpperCase() + style.slice(1)}
      </button>
    ))}
  </div>
);

export default Toolbar;
