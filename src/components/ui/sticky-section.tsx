"use client"

import React, { Children, isValidElement } from "react"

interface StickyItemProps {
  title: string
  id: string | number
  children: React.ReactNode
}

const StickyItem: React.FC<StickyItemProps> = () => null

interface StickySectionsProps {
  children: React.ReactNode
  /** Height of the main nav to offset sticky headers */
  navHeight?: string
}

const StickySections: React.FC<StickySectionsProps> & {
  Item: React.FC<StickyItemProps>
} = ({ children, navHeight = "0px" }) => {
  const stickyTop = `calc(${navHeight} - 1px)`

  return (
    <div style={{ overflow: "clip" }}>
      {Children.map(children, (child) => {
        if (!isValidElement(child) || child.type !== StickyItem) return null

        const { title, id, children: content } =
          child.props as StickyItemProps

        return (
          <section
            key={id}
            style={{
              position: "relative",
              overflow: "clip",
              background: "#09090b",
            }}
          >
            {/* Sticky header */}
            <div
              style={{
                position: "sticky",
                top: stickyTop,
                zIndex: 10,
                marginTop: -1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background: "#09090b",
                }}
              >
                <div
                  style={{
                    maxWidth: 1140,
                    margin: "0 auto",
                    padding: "1.15rem 2.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 300,
                      fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      color: "#ffffff",
                      margin: 0,
                    }}
                  >
                    {title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Section content */}
            <div
              style={{
                maxWidth: 1140,
                margin: "0 auto",
                padding: "4rem 2.5rem",
              }}
            >
              {content}
            </div>
          </section>
        )
      })}
    </div>
  )
}

StickySections.Item = StickyItem

export { StickySections, StickyItem }
