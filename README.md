# calculateLinearGradient-FigmaAPI
This function calculates a linear gradient string given a node &amp; fill from the Figma API (not plugin API)

// Example Usage

'component' is a node from the Figma API

```
component.fills.map((fill: any) => {
  if(fill.type == "GRADIENT_LINEAR" && fill.visible != false) {
    let gradientStr = createLinearGradient(fill, component)
  }
})
```


If still not working, feel free to email nushainef@gmail.com for more assistance

