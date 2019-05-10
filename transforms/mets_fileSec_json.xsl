<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
  xmlns:mets="http://www.loc.gov/METS/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:xlink="http://www.w3.org/1999/xlink" 
  xsi:schemaLocation="http://www.loc.gov/METS/ http://www.loc.gov/standards/mets/mets.xsd"
  exclude-result-prefixes="mets xsi">

<xsl:output method="text"/>

    <!-- walk through entire document and do something with each -->
    <xsl:template match="@*|node()">
        <xsl:apply-templates select="@*|node()" />
    </xsl:template>
    
    <xsl:template match="//mets:file">
{ "id" : "<xsl:value-of select="@ID" />", "SEQ" : "<xsl:value-of select="@SEQ" />", "FLocatHref" : "<xsl:value-of select="(.)/mets:FLocat/@xlink:href" />" },
    </xsl:template>
    
</xsl:stylesheet>
