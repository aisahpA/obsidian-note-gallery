import { App, MarkdownPostProcessorContext, MarkdownRenderChild } from "obsidian";
import { render } from "preact";

import NoteGalleryPlugin from "~/main";
import NoteGalleryApp from "~/react";
import getSettings, { Settings } from "~/code-block/settings";

export default class CodeBlockNoteGallery extends MarkdownRenderChild {
  private settings: Settings;
  private reactEl: HTMLElement;
  private searchEl: HTMLElement;
  private noteGalleryId: string; // 添加唯一标识符

  constructor(
    public plugin: NoteGalleryPlugin,
    public src: string,
    public containerEl: HTMLElement,
    public app: App,
    public ctx: MarkdownPostProcessorContext,
  ) {
    super(containerEl);
    this.settings = getSettings(src, app, containerEl, ctx);
    
    // 生成唯一的 ID
    this.noteGalleryId = Math.random().toString(36).substring(2, 15);    
    // 设置容器的唯一标识
    containerEl.setAttribute("data-note-gallery-id", this.noteGalleryId);
    // 确保类名存在
    containerEl.classList.add("block-language-note-gallery");
  }

  async onload() {
    this.searchEl = this.containerEl.createEl("div");
    this.reactEl = this.containerEl.createEl("div");

    this.searchEl.style.display = "none";
    this.searchEl.style.overflowY = "scroll";

    if (!this.plugin.EmbeddedSearch) {
      await this.plugin.triggerEmbeddedSearchPatch();
    } else {
      this.plugin.app.workspace.trigger(`catchEmbeddedSearch:${this.noteGalleryId}`, this.plugin.EmbeddedSearch);
    }
    
    render(
      <NoteGalleryApp
        app={this.app}
        plugin={this.plugin}
        component={this}
        containerEl={this.reactEl}
        searchEl={this.searchEl}
        sourcePath={this.ctx.sourcePath}
        settings={this.settings}
        db={this.plugin.db}
        noteGalleryId={this.noteGalleryId}
      />,
      this.reactEl,
    );
  }

  async onunload() {
    render(null, this.reactEl);
  }
}
