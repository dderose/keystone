<h1 class="u-kilo u-weightSlightBold u-textUnderlineBorder u-paddingBottomHalf"><span class="u-colorSectionHeading">0.0 ::</span> Overview</h1>

The Front-End Development Framework (The FED) is a rapid-development framework for easy and quick adoption of the ConstantContact look and feel.
FED includes base styles, flexible utilities and copy-and-paste components, delivered via Akamai, our CDN.


<br>
#### How to use the FED:

There are seven steps to getting FED into your application:

1. **Cloud Typography:** include font definitions from third party service. *Will only render on constantcontact.com or roving.com domains*
2. **FED CSS:** include the latest version of FED from the CDN
3. **FED Wrapper:** activate FED CSS for areas of your page by wrapping it inside `<div class="fed-wrapper"></div>`
4. **jQuery:** include version 1.7.1 or higher of jQuery on your page if you need any FED JavaScript components
5. **moment:**  include version 2.5.1 or higher of moment.js if you need the date picker component
5. **FED JavaScript:** include the latest version of FED JavaScript from the CDN
6. **Initialize FED JavaScript:** FED JavaScript components are jQuery plugins, and they must be initialized with your required options

[Here's a starter template to get you up and running quickly](https://github.roving.com/gist/bwalter/655).

<br>
#### Quick Reference Embeds:
- **CSS:** `<link rel="stylesheet" href="https://static.ctctcdn.com/h/fed-framework/{version}/fed.min.css" />`
- **JS:** `<script src="https://static.ctctcdn.com/h/fed-framework/{version}/fed.min.js"></script>`
- **Fonts:** `<link rel="stylesheet" href="//cloud.typography.com/7508852/770622/css/fonts.css" />`

<br>
#### FED Project Links:
- [Github Repo](https://github.roving.com/ES/fed-framework)
- [Wiki](https://github.roving.com/ES/fed-framework/wiki)
- [CHANGELOG](https://github.roving.com/ES/fed-framework/wiki/CHANGELOG)
- [Jenkins: Prod](https://jenkins1.roving.com/job/build-fed_framework-master/)
- [Jenkins: Dev](https://jenkins1.roving.com/job/build-fed_framework-development/)
- [Jenkins: Huxley Jobs](https://p2-qajenkins101.ad.prodcc.net/jenkins/view/%20CachedViews/view/HUXLEY/view/hux-Runs/)
- [Jenkins: Make Huxley Jobs](https://p2-qajenkins101.ad.prodcc.net/jenkins/job/JOB-BUILD-HUX/)


<br>
#### FED Syntax Conventions:
- **Utility:** *[ u-utilityName ]* Targeted, isolated style helpers intended to overwrite the default behavior of components.
- **Component:** *[ ComponentName ]* Components are modules of isolated markup, like reusable building blocks.
- **Children:** *[ ComponentName-childName ]* Children elements are contained within components.
- **Modifiers:** *[ ComponentName--modifierName ]* A modifier is an alternative skin or appearance of a component.
- **State:** *[ is-stateName ]* State classes are applied to components and denote an altered status of a component, usually toggled by JavaScript.
- **JavaScript:** *[ js-hookName ]* All handles for JavaScript interactivity should be explicitly denoted and separate from styling classes.
- **Responsive:** *[ b1-u-utilityName ]* There are 4 breakpoints in FED, denoted by b1-&#42;, b2-&#42;, b3-&#42;, b4-&#42;. They are min-width.


<br>
#### QE Automation Helpers:
All interactive and dynamic components should be tagged with Quality Engineering IDs. The "qe-ids" enable QE to easily automate testing of FED components integrated into applications.

- **HTML Attribute:** *data-qe-id*
- **Value Naming Convention:**
    - Each data-qe-id should be unique per page.
    - Each data-qe-id should communicate the component, type and name if applicable
    - Example: *data-qe-id="modal1.trigger"*
    - Iterator Example: *data-qe-id="List.Item List.item1"*
