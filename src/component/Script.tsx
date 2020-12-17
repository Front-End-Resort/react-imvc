import React from 'react'
import { htmlEscapeJsonStringify } from '../util/htmlescape'

export interface ScriptProps {
  children: string
}

export default function Script(props: ScriptProps) {
  let children = props.children || ''
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: htmlEscapeJsonStringify(children),
      }}
    />
  )
}
