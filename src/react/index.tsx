import { App, Component, EmbeddedSearchClass } from "obsidian";
import { useEffect, useState } from "preact/hooks";

import AppMount from "~/react/context/app-mount-provider";
import Gallery from "~/react/components/Gallery";
import { Settings } from "~/code-block/settings";
import { Database } from "~/index/database";
import NoteGalleryPlugin, { dbHTMLEntry } from "~/main";

interface NoteGalleryAppProps {
  app: App;
  plugin: NoteGalleryPlugin;
  component: Component;
  containerEl: HTMLElement;
  searchEl: HTMLElement;
  sourcePath: string;
  settings: Settings;
  db: Database<dbHTMLEntry>;
  noteGalleryId: string;
}

export default function NoteGalleryApp({
  app,
  plugin,
  component,
  containerEl,
  searchEl,
  sourcePath,
  settings,
  db,
  noteGalleryId,
}: NoteGalleryAppProps) {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [embeddedSearch, setEmbeddedSearch] = useState<EmbeddedSearchClass | undefined>(
    undefined,
  );

  useEffect(() => {
    containerEl.style.setProperty("--note-card-font-size", settings.fontsize);

    const createEmbeddedSearchInstance = (
      embeddedSearchConstructor: typeof EmbeddedSearchClass,
    ) => {
      if (!embeddedSearch) {
        const es = component.addChild(
          new embeddedSearchConstructor(app, searchEl, settings.query, sourcePath),
        );
        setEmbeddedSearch(es);
        console.log(`EmbeddedSearch instance created ${noteGalleryId}`);
      }
    };

    const ready = () => {
      if (!databaseReady) setDatabaseReady(true);
      if (plugin.EmbeddedSearch) createEmbeddedSearchInstance(plugin.EmbeddedSearch);
    };

    const notReady = () => {
      if (databaseReady) setDatabaseReady(false);
    };

    if (db.ready) ready();
    db.on("database-update", ready);
    db.on("database-drop", notReady);

    plugin.on(`catchEmbeddedSearch:${noteGalleryId}`, createEmbeddedSearchInstance);
    return () => {
      db.off("database-update", ready);
      db.off("database-drop", notReady);
      plugin.off(`catchEmbeddedSearch:${noteGalleryId}`, createEmbeddedSearchInstance);
    };

  }, [noteGalleryId, embeddedSearch, db]);

  return (
    <AppMount
      plugin={plugin}
      app={app}
      component={component}
      sourcePath={sourcePath}
      db={db}
      embeddedSearch={embeddedSearch}
      settings={settings}
      noteGalleryId={noteGalleryId}
    >
      {!databaseReady && (
        <div>
          <h1>Note Gallery: Indexing Database...</h1>
        </div>
      )}
      {databaseReady && <Gallery />}
    </AppMount>
  );
}
