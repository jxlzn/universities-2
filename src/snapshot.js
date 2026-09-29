import { mount } from 'svelte'
import './app.css'
import Snapshot from './Snapshot.svelte'

mount(Snapshot, {
  target: document.getElementById('snap'),
})
