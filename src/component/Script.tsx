import React from 'react'

export interface ScriptProps {
  children: string
}

export default function Script(props: ScriptProps) {
  let children = props.children || ''
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: children.replace(/<\/script/gi, '&lt/script'),
      }}
    />
  )
}
