"use client";

import { useEffect, useState } from "react";
import { Joyride, STATUS, Step, EventData } from "react-joyride";

export function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("topline_tour_completed");
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const handleJoyrideEvent = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem("topline_tour_completed", "true");
    }
  };

  const steps: Step[] = [
    {
      target: "#tour-header",
      content: "Welcome to IndexHub! This tool helps you extract and index PNG files directly from Google Drive securely.",
    },
    {
      target: "#folderUrl",
      content: "Paste your public Google Drive folder link here. Make sure its sharing settings are set to 'Anyone with the link can view'.",
    },
    {
      target: "#tour-extract-btn",
      content: "Click 'Extract Files' to begin processing. Once complete, you can preview the results and export them to Excel!",
    },
  ];

  return (
    <Joyride
      onEvent={handleJoyrideEvent}
      continuous
      run={run}
      scrollToFirstStep
      steps={steps}
      options={{
        zIndex: 10000,
        primaryColor: "#0f172a", // slate-900
        textColor: "#334155", // slate-700
        backgroundColor: "#ffffff",
        arrowColor: "#ffffff",
        showProgress: true,
      }}
      styles={{
        buttonClose: {
          display: "none",
        },
        buttonPrimary: {
          backgroundColor: "#0f172a",
          borderRadius: "8px",
          color: "#f8fafc",
          padding: "8px 16px",
          fontWeight: 500,
        },
        buttonBack: {
          color: "#64748b",
          marginRight: "8px",
          fontWeight: 500,
        },
        buttonSkip: {
          color: "#64748b",
          fontWeight: 500,
        },
        tooltip: {
          borderRadius: "12px",
          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipTitle: {
          fontWeight: 600,
          color: "#0f172a",
          marginBottom: "8px",
        },
      }}
    />
  );
}
