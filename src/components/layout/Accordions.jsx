/**
 * @file Accordions.jsx
 * @description Expandable accordion panel grids (Settings, FAQs, and Service Advisory details).
 */

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Shield, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Core Accordion Component
export const AccordionItem = ({ title, icon, children, isOpen, onToggle }) => {
  return (
    <div className="border border-border bg-card rounded-lg overflow-hidden transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-text-primary hover:bg-secondary/40 transition-colors text-left focus:outline-none"
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-text-secondary shrink-0">{icon}</span>}
          <span>{title}</span>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-text-muted transition-transform duration-200", isOpen && "transform rotate-180")}
        />
      </button>
      
      {isOpen && (
        <div className="px-4 py-3 border-t border-border/40 text-xs text-text-secondary select-text animate-in fade-in slide-in-from-top-1 duration-150 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export const Accordion = ({ children, className }) => {
  return <div className={cn("flex flex-col gap-2 w-full", className)}>{children}</div>;
};

// 1. Settings Accordion
export const SettingsAccordion = ({ className }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const sections = [
    {
      title: "Map telemetry & update interval",
      icon: <Shield className="h-4 w-4" />,
      content: "Configure database query speed. Faster intervals consume more mobile data. Default: 5 seconds.",
    },
    {
      title: "Audio alerts & voice synthesis",
      icon: <Volume2 className="h-4 w-4" />,
      content: "Receive screen reader updates for nearby stops and arrivals. Accessible for low-vision users.",
    },
  ];

  return (
    <Accordion className={className}>
      {sections.map((sec, idx) => (
        <AccordionItem
          key={idx}
          title={sec.title}
          icon={sec.icon}
          isOpen={openIndex === idx}
          onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
        >
          {sec.content}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// 2. FAQ Accordion
export const FaqAccordion = ({ className }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "How accurate is the bus GPS signal?",
      a: "Buses transmit location coordinates every 5 seconds. GPS drift may cause minor variations of up to 15 meters on active maps.",
    },
    {
      q: "Why are some bus numbers missing from live feeds?",
      a: "Only vehicles equipped with functional GPS telemetry modules transmit coordinates. Non-telemetry buses run on fixed schedules.",
    },
  ];

  return (
    <Accordion className={className}>
      {faqs.map((faq, idx) => (
        <AccordionItem
          key={idx}
          title={faq.q}
          icon={<HelpCircle className="h-4 w-4 text-text-muted" />}
          isOpen={openIndex === idx}
          onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
        >
          {faq.a}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

// 3. Information Accordion (Service advisories)
export const InformationAccordion = ({ className }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const advisories = [
    {
      title: "Mysuru Palace traffic diversions",
      content: "Due to VIP movements, all buses passing through Palace gate will be delayed by 10-15 minutes.",
    },
    {
      title: "Chamundi Hill evening scheduling changes",
      content: "Extra runs are added to Line 201 every Friday evening from 5:00 PM to 9:00 PM.",
    },
  ];

  return (
    <Accordion className={className}>
      {advisories.map((adv, idx) => (
        <AccordionItem
          key={idx}
          title={adv.title}
          isOpen={openIndex === idx}
          onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
        >
          {adv.content}
        </AccordionItem>
      ))}
    </Accordion>
  );
};
