import os
import sys
from timeit import default_timer as timer
from datetime import datetime, timedelta

from mkdocs import utils as mkdocs_utils
from mkdocs.config import config_options, Config
from mkdocs.plugins import BasePlugin

import re
import urllib.parse

import mkdocs.plugins
from mkdocs.config import config_options as c
from mkdocs.config.defaults import MkDocsConfig
from jinja2 import pass_context

logger = mkdocs.plugins.get_plugin_logger(__name__)

def fix_url(url, site_url, current_url):
  """
  Fix relative and absolute URLs to have the correct site prefix.

  Args:
      url (str): The URL to fix
      site_url (str): The base site URL
      current_url (str): The current page URL

  Returns:
      str: The fixed URL with proper prefix
  """

  logger.info(f"fix_url relative URL: {url} to {site_url} (from page {current_url})")

  # Extract site path from site_url
  site_path = urllib.parse.urlparse(site_url).path

  # Ensure site_path has proper formatting
  if not site_path:
    site_path = "/"
  if not site_path.endswith("/"):
    site_path += "/"

  # If URL is empty or None, return as is
  if not url:
    return url

  # Get current page directory path
  current_dir = os.path.dirname(current_url)

  if url == '.':
    final_url = f"{site_path}"
  elif url.startswith("/"):
    # Absolute path within the site
    clean_url = url[1:]  # Remove leading slash
    final_url = f"{site_path}{clean_url}"
  elif url.startswith("../") or url.startswith("./"):
    # Relative path that needs resolution based on current page
    # Resolve the path relative to current page directory
    if url.startswith("./"):
      # For "./bla" format
      resolved_path = os.path.normpath(os.path.join(current_dir, url[2:]))
    else:
      # For "../bla" format
      resolved_path = os.path.normpath(os.path.join(current_dir, url))

    # Remove any ".md" extension
    if resolved_path.endswith(".md"):
      resolved_path = resolved_path[:-3]

    # Ensure path starts with / but doesn't have //
    if not resolved_path.startswith("/"):
      resolved_path = "/" + resolved_path

    final_url = f"{site_path.rstrip('/')}{resolved_path}"
  elif url.startswith(('http://', 'https://', 'mailto:', 'tel:', '#')):
    # External URL or anchor - return unchanged
    final_url = url
  else:
    # Treat as relative to current directory
    resolved_path = os.path.normpath(os.path.join(current_dir, url))

    # Remove any ".md" extension
    if resolved_path.endswith(".md"):
      resolved_path = resolved_path[:-3]

    # Ensure path starts with / but doesn't have //
    if not resolved_path.startswith("/"):
      resolved_path = "/" + resolved_path

    final_url = f"{site_path.rstrip('/')}{resolved_path}"

  return final_url


class FixUrlsPluginConfig(mkdocs.config.base.Config):
  attributes = c.Type(list, default=["href", "src", "data"])
  prefix = c.Type(str, default="site")
  absolute_url = c.Type(str, default="/")
  absolute_url = c.Type(str, default="/")

class FixUrlsPlugin(mkdocs.plugins.BasePlugin[FixUrlsPluginConfig]):
  config_scheme = (
    ('param', config_options.Type(str, default='')),
  )

  def __init__(self):
    self.enabled = True
    self.absolute_url = '/'
    self.prefix = 'site'
    self.prefix_absolute = 'absolute_host_site'

  def on_env(self, env, config, files):
    site_url = self.absolute_url if len(self.absolute_url) != 0 else config["site_url"]

    # Create a context filter that has access to the full template context
    @pass_context
    def fix_url_filter(context, url):
      page = context.get('page', {})
      current_url = page.url if page else ''
      return fix_url(url, site_url, current_url)

    env.filters['fix_url'] = fix_url_filter
    return env

  def on_pre_build(self, *, config: MkDocsConfig) -> None:
    self.prefix = self.config.get("prefix", self.prefix)
    self.prefix_absolute = self.config.get("prefix_absolute", self.prefix_absolute)
    self.regex = re.compile(
      r"(" + "|".join(self.config["attributes"]) + r')="' + self.prefix + r':([^"]+)"',
      re.IGNORECASE,
      )
    self.regex_prefix_absolute = re.compile(
      r"(" + "|".join(self.config["attributes"]) + r')="' + self.prefix_absolute + r':([^"]+)"',
      re.IGNORECASE,
      )

    logger.info(f"absolute_url: {self.absolute_url} prefix {self.prefix} prefix_absolute: {self.prefix_absolute}")

  @mkdocs.plugins.event_priority(50)
  def on_page_content(self, html, page, config, files):
    site_url = self.absolute_url if len(self.absolute_url) != 0 else config["site_url"]
    site_path = urllib.parse.urlparse(site_url).path

    absolute_host_url = config["site_url"] if config["site_url"] else "/"
    absolute_host_url = urllib.parse.urlparse(absolute_host_url).path
    if absolute_host_url.endswith("/"):
      absolute_host_url = absolute_host_url[:-1]

    # logger.info(page)
    if not site_path:
      site_path = "/"
    if not site_path.endswith("/"):
      site_path += "/"

    # Get current page directory path
    current_page_url = page.url
    current_dir = os.path.dirname(current_page_url)

    logger.info(f"Try to converted relative URL: {current_page_url}. Folder is: {current_dir}")

    def _replace(match):
      param = match.group(1)
      url = match.group(2)
      logger.info(f"_replace: {param}. url is: {url}")
      if url.startswith("/"):
        # Absolute path within the site
        clean_url = url[1:]  # Remove leading slash
        final_url = f"{site_path}{clean_url}"
      elif url.startswith("../") or url.startswith("./"):
        # Relative path that needs resolution based on current page
        # Resolve the path relative to current page directory
        if url.startswith("./"):
          # For "./something" format
          resolved_path = os.path.normpath(os.path.join(current_dir, url[2:]))
        else:
          # For "../something" format
          resolved_path = os.path.normpath(os.path.join(current_dir, url))

        # Remove any ".md" extension
        if resolved_path.endswith(".md"):
          resolved_path = resolved_path[:-3]

        # Ensure path starts with / but doesn't have //
        if not resolved_path.startswith("/"):
          resolved_path = "/" + resolved_path

        final_url = f"{site_path.rstrip('/')}{resolved_path}"
      else:
        final_url = f"{site_path}{url}"

      logger.info(f"Converted relative URL: {url} to {final_url} (from page {current_page_url})")

      return f'{param}="{final_url}"'

    def _replace_absolute(match):
      param = match.group(1)
      url = match.group(2)
      logger.info(f"_replace_absolute: {param}. url is: {url}")
      if url.startswith("/"):
        clean_url = url
        final_url = f"{absolute_host_url}{clean_url}"
      else:
        final_url = f"{absolute_host_url}{url}"

      logger.info(f"Converted absolute host URL: {url} to {final_url} (from page {current_page_url})")

      return f'{param}="{final_url}"'

    result = self.regex.sub(_replace, html)
    # html = self.regex_prefix_absolute.sub(_replace_absolute, html)
    return result
