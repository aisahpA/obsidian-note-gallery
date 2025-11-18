import { TFile } from "obsidian";
import React from "preact/compat";
import { ComponentChildren, Key } from "preact";

import { useAppMount } from "~/react/context/app-mount-provider";

interface WithKeyProps {
  key?: Key;
}

interface CardPropsI {
  file?: TFile;
  children: ComponentChildren;
}

type CardProps = CardPropsI & React.HTMLAttributes<HTMLDivElement> & WithKeyProps;

export default function Card(props: CardProps) {
  const { file, ...rest } = props;
  const { app, sourcePath, settings } = useAppMount();
  const handleClick = (event: MouseEvent): void => {
    const newLeaf =
      event.altKey && (event.ctrlKey || event.metaKey)
        ? "split"
        : event.ctrlKey || event.metaKey
        ? "tab"
        : false;
    if (file) {
      app.workspace.openLinkText(file.path, sourcePath, newLeaf);
    }
  };

  // 样式
  const cardStyle: React.CSSProperties = {
    overflow: settings.overflow ? "auto" : undefined,
    maxHeight: settings.maxheight || undefined
  };

  return (
    <div {...rest} className="note-card" style={cardStyle} onClick={handleClick}>
      {props.children}
    </div>
  );
}
