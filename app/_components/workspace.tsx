"use client";

const HTML5_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title></title>
</head>
<body>
  <p>Hello World</p>
</body>
</html>`;

import { useDeferredValue, useState } from "react";
import CodeEditor from "./code-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSearchParams } from "next/navigation";

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("Async: Could not copy text: ", err);
    },
  );
}

export default function Workspace() {
  const params = useSearchParams();
  const defaultCode = params.get("code")?.replaceAll("\\n", "\n");
  const defaultDirection =
    params.get("direction") === "vertical" ? "vertical" : "horizontal";
  const defaultSwapLayout = params.get("swapLayout") === "true" ? true : false;
  const defaultFontSize = Number.parseInt(params.get("fontSize") ?? "16");
  const defaultZoom = Number.parseFloat(params.get("zoom") ?? "1.0");
  const isHideActionbar = params.get("hideActionbar") === "true";
  const [code, setCode] = useState(defaultCode ?? HTML5_TEMPLATE);
  const [zoom, setZoom] = useState(defaultZoom);
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const deferredCode = useDeferredValue(code);
  const [direction, setDirection] = useState<"vertical" | "horizontal">(
    defaultDirection,
  );
  const [swapLayout, setSwapLayout] = useState<boolean>(defaultSwapLayout);

  function copyLink(hideActionbar: boolean = false) {
    const url = `${window.location.origin}?code=${encodeURIComponent(code.replaceAll("\n", "\\n"))}&hideActionbar=${hideActionbar}&direction=${direction}&swapLayout=${swapLayout}&fontSize=${fontSize}&zoom=${zoom}`;
    if (url.length >= 2000) {
      alert("程式碼過長無法複製 qwq");
      return;
    }
    copyTextToClipboard(url);
    alert("複製成功");
  }

  return (
    <div className="w-full h-screen overflow-hidden bg-[#2e3440] p-3 flex flex-col gap-3">
      {!isHideActionbar && (
        <div className="flex bg-transparent gap-3 rounded-md">
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => copyLink()}
          >
            複製連結
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => copyLink(true)}
          >
            複製隱藏 Actionbar 的連結
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => setFontSize((pre) => pre + 1)}
          >
            編輯器字體增大 {fontSize}
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => setFontSize((pre) => pre - 1)}
          >
            編輯器字體縮小 {fontSize}
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => setZoom((pre) => pre + 0.1)}
          >
            預覽放大 {zoom.toFixed(1)}
          </button>
          <button
            className="bg-[#4c566a] text-white py-1 px-3 rounded-md"
            onClick={() => setZoom((pre) => pre - 0.1)}
          >
            預覽縮小 {zoom.toFixed(1)}
          </button>
          <label className="flex gap-1 items-center text-white select-none">
            <input
              type="checkbox"
              checked={direction === "vertical"}
              onChange={(e) => {
                setDirection(e.target.checked ? "vertical" : "horizontal");
              }}
            />
            縱向佈局
          </label>
          <label className="gap-1 items-center hidden">
            <input
              type="checkbox"
              checked={swapLayout}
              onChange={(e) => {
                setSwapLayout(e.target.checked);
              }}
            />
            交錯佈局
          </label>
        </div>
      )}
      <ResizablePanelGroup
        direction={direction}
        className="h-full w-full gap-2"
      >
        <ResizablePanel>
          <div className="w-full h-full rounded-md overflow-hidden">
            <CodeEditor
              fontSize={fontSize}
              value={deferredCode}
              onChange={(e) => {
                setCode(e ?? "");
              }}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle
          withHandle={true}
          className={`text-[#4c566a] bg-slate-500 rounded-md`}
          color="#1111111"
        />
        <ResizablePanel>
          <iframe
            className="w-full h-full overflow-scroll origin-top-left border-none bg-white rounded-sm"
            style={{
              transform: `scale(${zoom})`,
            }}
            src={`data:text/html;charset=utf-8,${encodeURIComponent(code)}`}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
