/**
 * 
 */
package org.hisp.dhis.dxf2.datavalueset;

import org.hisp.staxwax.reader.XMLReader;
import org.hisp.staxwax.writer.XMLWriter;

/**
 * @author abyot
 *
 */
public class StreamingXmlCompleteDataSet extends CompleteDataSet {
	
	private static final String FIELD_DATASET = "dataSet";
	private static final String FIELD_DATAVALUE = "dataValue";
    private static final String FIELD_ATTRIBUTE_OPTION_COMBO = "attributeOptionCombo";
    private static final String FIELD_PERIOD = "period";
    private static final String FIELD_ORGUNIT = "orgUnit";    
    private static final String FIELD_STOREDBY = "storedBy";
    private static final String FIELD_COMPLETEDATE = "completeDate";

    private XMLWriter writer;

    private XMLReader reader;

    //--------------------------------------------------------------------------
    // Constructors
    //--------------------------------------------------------------------------

    public StreamingXmlCompleteDataSet( XMLWriter writer )
    {
        this.writer = writer;

        this.writer.openElement( FIELD_DATAVALUE );
    }

    public StreamingXmlCompleteDataSet( XMLReader reader )
    {
        this.reader = reader;
    }

    //--------------------------------------------------------------------------
    // Getters
    //--------------------------------------------------------------------------

    @Override
    public String getDataSet()
    {
        return dataSet = dataSet == null ? reader.getAttributeValue( FIELD_DATASET ) : dataSet;
    }

    @Override
    public String getPeriod()
    {
        return period = period == null ? reader.getAttributeValue( FIELD_PERIOD ) : period;
    }

    @Override
    public String getOrgUnit()
    {
        return orgUnit = orgUnit == null ? reader.getAttributeValue( FIELD_ORGUNIT ) : orgUnit;
    }
        
    @Override
    public String getAttributeOptionCombo()
    {
        return attributeOptionCombo = attributeOptionCombo == null ? reader.getAttributeValue( FIELD_ATTRIBUTE_OPTION_COMBO ) : attributeOptionCombo;
    }
    
    @Override
    public String getStoredBy()
    {
        return storedBy = storedBy == null ? reader.getAttributeValue( FIELD_STOREDBY ) : storedBy;
    }
    
    //--------------------------------------------------------------------------
    // Setters
    //--------------------------------------------------------------------------

    @Override
    public void setDataSet( String dataSet )
    {
        writer.writeAttribute( FIELD_DATASET, dataSet );
    }

    @Override
    public void setPeriod( String period )
    {
        writer.writeAttribute( FIELD_PERIOD, period );
    }

    @Override
    public void setOrgUnit( String orgUnit )
    {
        writer.writeAttribute( FIELD_ORGUNIT, orgUnit );
    }
    
    @Override
    public void setCompleteDate( String completeDate )
    {
        writer.writeAttribute( FIELD_COMPLETEDATE, completeDate );
    }

    @Override
    public void setStoredBy( String storedBy )
    {
        writer.writeAttribute( FIELD_STOREDBY, storedBy );
    }

    @Override
    public void close()
    {
        writer.closeElement();
    }

}
